-- 10_product_variants.sql
-- VYAPAR: Product variants (size, color, etc.)
--
-- Safe to run multiple times.

begin;

-- Variant type enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'variant_type') then
    create type public.variant_type as enum ('size', 'color', 'material', 'style', 'other');
  end if;
end $$;

-- Product variants table
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  
  product_id uuid not null references public.products(id) on delete cascade,
  
  -- Variant attributes
  variant_type public.variant_type not null,
  variant_value text not null, -- e.g., "Large", "Red", "Cotton"
  
  -- Variant-specific pricing (optional, falls back to product price)
  price_override numeric(12,2),
  
  -- Variant SKU (optional)
  sku text,
  
  -- Display order
  display_order integer not null default 0,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint product_variants_price_override_check check (
    price_override is null or price_override >= 0
  ),
  constraint product_variants_unique_variant unique (product_id, variant_type, variant_value)
);

-- Indexes
create index if not exists idx_product_variants_product_id on public.product_variants(product_id);
create index if not exists idx_product_variants_sku on public.product_variants(sku) where sku is not null;

-- Updated_at trigger
drop trigger if exists update_product_variants_updated_at on public.product_variants;
create trigger update_product_variants_updated_at
  before update on public.product_variants
  for each row
  execute function public.update_updated_at_column();

-- Enable RLS
alter table public.product_variants enable row level security;

-- RLS Policies
-- Public can read variants for approved products
drop policy if exists product_variants_select_public on public.product_variants;
create policy product_variants_select_public
on public.product_variants
for select
to anon, authenticated
using (
  exists (
    select 1 from public.products
    where id = product_variants.product_id
    and status = 'approved'
    and is_active = true
  )
);

-- Sellers can manage variants for their own products
drop policy if exists product_variants_select_seller on public.product_variants;
create policy product_variants_select_seller
on public.product_variants
for select
to authenticated
using (
  exists (
    select 1 from public.products p
    join public.seller_profiles sp on p.seller_id = sp.id
    where p.id = product_variants.product_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
);

drop policy if exists product_variants_insert_seller on public.product_variants;
create policy product_variants_insert_seller
on public.product_variants
for insert
to authenticated
with check (
  exists (
    select 1 from public.products p
    join public.seller_profiles sp on p.seller_id = sp.id
    where p.id = product_variants.product_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
);

drop policy if exists product_variants_update_seller on public.product_variants;
create policy product_variants_update_seller
on public.product_variants
for update
to authenticated
using (
  exists (
    select 1 from public.products p
    join public.seller_profiles sp on p.seller_id = sp.id
    where p.id = product_variants.product_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.products p
    join public.seller_profiles sp on p.seller_id = sp.id
    where p.id = product_variants.product_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
);

drop policy if exists product_variants_delete_seller on public.product_variants;
create policy product_variants_delete_seller
on public.product_variants
for delete
to authenticated
using (
  exists (
    select 1 from public.products p
    join public.seller_profiles sp on p.seller_id = sp.id
    where p.id = product_variants.product_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
);

-- Admins have full access
drop policy if exists product_variants_all_admin on public.product_variants;
create policy product_variants_all_admin
on public.product_variants
for all
to authenticated
using (
  exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  )
);

commit;

-- 01_products.sql
-- eCom demo: products table
--
-- Safe to run multiple times.

begin;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(12,2) not null,
  category text not null,
  -- Supabase Storage object path inside bucket `product-images`
  -- Expected format: {product_id}/main.jpg
  image_path text,
  seller_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),

  constraint products_price_nonneg check (price >= 0)
);

create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_products_category on public.products(category);

alter table public.products enable row level security;

-- Public read access for active products (demo requirement)
drop policy if exists products_public_select on public.products;
create policy products_public_select
on public.products
for select
to anon, authenticated
using (is_active = true);

-- Backfill image_path for existing rows (Storage-only images).
-- This does NOT upload images. It only sets the expected object path:
--   product-images/{product_id}/main.jpg
update public.products
set image_path = (id::text || '/main.jpg')
where image_path is null;

commit;

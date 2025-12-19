-- 09_products_extended.sql
-- VYAPAR: Extended products table with seller ownership and approval workflow
--
-- Extends existing products table (backward compatible)
-- Safe to run multiple times.

begin;

-- Product approval status
do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_status') then
    create type public.product_status as enum (
      'draft',
      'pending_approval',
      'approved',
      'rejected',
      'archived'
    );
  end if;
end $$;

-- Add new columns to existing products table (backward compatible)
do $$
begin
  -- Seller reference
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'seller_id'
  ) then
    alter table public.products
    add column seller_id uuid references public.seller_profiles(id) on delete restrict;
  end if;

  -- Product status
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'status'
  ) then
    -- Add column as nullable first
    alter table public.products
    add column status public.product_status;
    
    -- Set status for existing products based on is_active
    update public.products
    set status = case 
      when is_active = true then 'approved'::public.product_status
      else 'archived'::public.product_status
    end
    where status is null;
    
    -- Now make it NOT NULL with default
    alter table public.products
    alter column status set not null,
    alter column status set default 'draft';
  end if;

  -- Extended product information
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'sku'
  ) then
    alter table public.products
    add column sku text unique;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'gst_rate'
  ) then
    alter table public.products
    add column gst_rate numeric(5,2) not null default 0.00;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'weight_grams'
  ) then
    alter table public.products
    add column weight_grams integer;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'dimensions_cm'
  ) then
    alter table public.products
    add column dimensions_cm jsonb; -- {length, width, height}
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'meta_tags'
  ) then
    alter table public.products
    add column meta_tags text[]; -- Search tags
  end if;

  -- Approval workflow
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'approved_at'
  ) then
    alter table public.products
    add column approved_at timestamptz;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'approved_by'
  ) then
    alter table public.products
    add column approved_by uuid references public.user_profiles(id);
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'rejection_reason'
  ) then
    alter table public.products
    add column rejection_reason text;
  end if;

  -- Backward compatibility: migrate existing products
  -- Set seller_name as a fallback (will need manual assignment later)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'seller_name'
  ) then
    -- Keep seller_name for backward compatibility
    -- New products should use seller_id
  end if;

  -- Ensure existing active products are approved (in case status was set to draft)
  -- This handles cases where the column already existed
  update public.products
  set status = 'approved'
  where status = 'draft' and is_active = true;
  
  update public.products
  set status = 'archived'
  where status = 'draft' and is_active = false;
end $$;

-- Constraints (idempotent)
do $$
begin
  -- Add GST rate constraint if it doesn't exist
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_gst_rate_check'
    and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
    add constraint products_gst_rate_check
    check (gst_rate >= 0 and gst_rate <= 100);
  end if;

  -- Add weight constraint if it doesn't exist
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_weight_grams_check'
    and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
    add constraint products_weight_grams_check
    check (weight_grams is null or weight_grams > 0);
  end if;
end $$;

-- Indexes
create index if not exists idx_products_seller_id on public.products(seller_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_sku on public.products(sku) where sku is not null;
create index if not exists idx_products_meta_tags on public.products using gin(meta_tags);

-- Update RLS policies
-- Drop old public select policy
drop policy if exists products_public_select on public.products;

-- New policy: public can only see approved and active products
-- Also allow products without status column (backward compatibility)
-- Note: Run 20_migrate_existing_products.sql after this to approve existing products
create policy products_public_select
on public.products
for select
to anon, authenticated
using (
  is_active = true
  and (
    status = 'approved'
    or status is null  -- Backward compatibility: allow products without status column
  )
);

-- Sellers can read their own products (all statuses)
drop policy if exists products_select_own on public.products;
create policy products_select_own
on public.products
for select
to authenticated
using (
  seller_id = (
    select id from public.seller_profiles
    where id = (select id from public.user_profiles where id = auth.uid())
  )
);

-- Sellers can insert their own products
drop policy if exists products_insert_seller on public.products;
create policy products_insert_seller
on public.products
for insert
to authenticated
with check (
  seller_id = (
    select id from public.seller_profiles
    where id = (select id from public.user_profiles where id = auth.uid())
  )
  and status in ('draft', 'pending_approval')
);

-- Sellers can update their own products (limited to draft/pending)
drop policy if exists products_update_seller on public.products;
create policy products_update_seller
on public.products
for update
to authenticated
using (
  seller_id = (
    select id from public.seller_profiles
    where id = (select id from public.user_profiles where id = auth.uid())
  )
  and status in ('draft', 'pending_approval', 'rejected')
)
with check (
  seller_id = (
    select id from public.seller_profiles
    where id = (select id from public.user_profiles where id = auth.uid())
  )
);

-- Admins can read all products
drop policy if exists products_select_admin on public.products;
create policy products_select_admin
on public.products
for select
to authenticated
using (
  exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Admins can update products (for approval workflow)
drop policy if exists products_update_admin on public.products;
create policy products_update_admin
on public.products
for update
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

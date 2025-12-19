-- 11_inventory.sql
-- VYAPAR: Inventory management per product variant
--
-- Safe to run multiple times.

begin;

-- Inventory table
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  
  -- Stock levels
  quantity_available integer not null default 0,
  quantity_reserved integer not null default 0, -- Reserved for pending orders
  quantity_sold integer not null default 0,
  
  -- Low stock threshold
  low_stock_threshold integer not null default 10,
  
  -- Warehouse location (optional)
  warehouse_location text,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint inventory_quantity_available_check check (quantity_available >= 0),
  constraint inventory_quantity_reserved_check check (quantity_reserved >= 0),
  constraint inventory_quantity_sold_check check (quantity_sold >= 0),
  constraint inventory_low_stock_threshold_check check (low_stock_threshold >= 0),
  constraint inventory_unique_product_variant unique (product_id, variant_id)
);

-- Indexes
create index if not exists idx_inventory_product_id on public.inventory(product_id);
create index if not exists idx_inventory_variant_id on public.inventory(variant_id);
create index if not exists idx_inventory_low_stock on public.inventory(product_id, variant_id)
  where quantity_available <= low_stock_threshold;

-- Updated_at trigger
drop trigger if exists update_inventory_updated_at on public.inventory;
create trigger update_inventory_updated_at
  before update on public.inventory
  for each row
  execute function public.update_updated_at_column();

-- Function to check stock availability
create or replace function public.check_stock_available(
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity integer
)
returns boolean as $$
declare
  v_available integer;
begin
  select quantity_available - quantity_reserved
  into v_available
  from public.inventory
  where product_id = p_product_id
    and (variant_id = p_variant_id or (variant_id is null and p_variant_id is null));
  
  return coalesce(v_available, 0) >= p_quantity;
end;
$$ language plpgsql;

-- Function to reserve stock
create or replace function public.reserve_stock(
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity integer
)
returns boolean as $$
begin
  update public.inventory
  set quantity_reserved = quantity_reserved + p_quantity
  where product_id = p_product_id
    and (variant_id = p_variant_id or (variant_id is null and p_variant_id is null))
    and (quantity_available - quantity_reserved) >= p_quantity;
  
  return found;
end;
$$ language plpgsql;

-- Function to release reserved stock
create or replace function public.release_reserved_stock(
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity integer
)
returns void as $$
begin
  update public.inventory
  set quantity_reserved = greatest(0, quantity_reserved - p_quantity)
  where product_id = p_product_id
    and (variant_id = p_variant_id or (variant_id is null and p_variant_id is null));
end;
$$ language plpgsql;

-- Function to fulfill stock (move from reserved to sold)
create or replace function public.fulfill_stock(
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity integer
)
returns void as $$
begin
  update public.inventory
  set 
    quantity_reserved = greatest(0, quantity_reserved - p_quantity),
    quantity_sold = quantity_sold + p_quantity,
    quantity_available = greatest(0, quantity_available - p_quantity)
  where product_id = p_product_id
    and (variant_id = p_variant_id or (variant_id is null and p_variant_id is null));
end;
$$ language plpgsql;

-- Enable RLS
alter table public.inventory enable row level security;

-- RLS Policies
-- Public can read inventory for approved products (to show availability)
drop policy if exists inventory_select_public on public.inventory;
create policy inventory_select_public
on public.inventory
for select
to anon, authenticated
using (
  exists (
    select 1 from public.products
    where id = inventory.product_id
    and status = 'approved'
    and is_active = true
  )
);

-- Sellers can manage inventory for their own products
drop policy if exists inventory_select_seller on public.inventory;
create policy inventory_select_seller
on public.inventory
for select
to authenticated
using (
  exists (
    select 1 from public.products p
    join public.seller_profiles sp on p.seller_id = sp.id
    where p.id = inventory.product_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
);

drop policy if exists inventory_insert_seller on public.inventory;
create policy inventory_insert_seller
on public.inventory
for insert
to authenticated
with check (
  exists (
    select 1 from public.products p
    join public.seller_profiles sp on p.seller_id = sp.id
    where p.id = inventory.product_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
);

drop policy if exists inventory_update_seller on public.inventory;
create policy inventory_update_seller
on public.inventory
for update
to authenticated
using (
  exists (
    select 1 from public.products p
    join public.seller_profiles sp on p.seller_id = sp.id
    where p.id = inventory.product_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.products p
    join public.seller_profiles sp on p.seller_id = sp.id
    where p.id = inventory.product_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
);

-- Admins have full access
drop policy if exists inventory_all_admin on public.inventory;
create policy inventory_all_admin
on public.inventory
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

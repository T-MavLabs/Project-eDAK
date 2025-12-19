-- 12_orders_extended.sql
-- VYAPAR: Extended orders table with buyer/seller references and fulfillment lifecycle
--
-- Extends existing orders table (backward compatible)
-- Safe to run multiple times.

begin;

-- Order status enum (extend existing)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'ecom_order_status') then
    create type public.ecom_order_status as enum ('placed', 'shipped');
  end if;
  
  -- Add new statuses if enum exists
  if exists (select 1 from pg_type where typname = 'ecom_order_status') then
    -- Check if new values exist, add if not
    if not exists (
      select 1 from pg_enum 
      where enumlabel = 'confirmed' 
      and enumtypid = (select oid from pg_type where typname = 'ecom_order_status')
    ) then
      alter type public.ecom_order_status add value 'confirmed';
    end if;
    
    if not exists (
      select 1 from pg_enum 
      where enumlabel = 'processing' 
      and enumtypid = (select oid from pg_type where typname = 'ecom_order_status')
    ) then
      alter type public.ecom_order_status add value 'processing';
    end if;
    
    if not exists (
      select 1 from pg_enum 
      where enumlabel = 'out_for_delivery' 
      and enumtypid = (select oid from pg_type where typname = 'ecom_order_status')
    ) then
      alter type public.ecom_order_status add value 'out_for_delivery';
    end if;
    
    if not exists (
      select 1 from pg_enum 
      where enumlabel = 'delivered' 
      and enumtypid = (select oid from pg_type where typname = 'ecom_order_status')
    ) then
      alter type public.ecom_order_status add value 'delivered';
    end if;
    
    if not exists (
      select 1 from pg_enum 
      where enumlabel = 'cancelled' 
      and enumtypid = (select oid from pg_type where typname = 'ecom_order_status')
    ) then
      alter type public.ecom_order_status add value 'cancelled';
    end if;
    
    if not exists (
      select 1 from pg_enum 
      where enumlabel = 'returned' 
      and enumtypid = (select oid from pg_type where typname = 'ecom_order_status')
    ) then
      alter type public.ecom_order_status add value 'returned';
    end if;
  end if;
end $$;

-- Add new columns to existing orders table
do $$
begin
  -- Buyer reference
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'buyer_id'
  ) then
    alter table public.orders
    add column buyer_id uuid references public.user_profiles(id) on delete set null;
  end if;

  -- Shipping address reference
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'shipping_address_id'
  ) then
    alter table public.orders
    add column shipping_address_id uuid; -- Will reference addresses table (created later)
  end if;

  -- Payment reference
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'payment_id'
  ) then
    alter table public.orders
    add column payment_id uuid; -- Will reference payments table (created later)
  end if;

  -- Extended shipping information
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'shipping_cost'
  ) then
    alter table public.orders
    add column shipping_cost numeric(12,2) not null default 0.00;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'tax_amount'
  ) then
    alter table public.orders
    add column tax_amount numeric(12,2) not null default 0.00;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'discount_amount'
  ) then
    alter table public.orders
    add column discount_amount numeric(12,2) not null default 0.00;
  end if;

  -- Fulfillment dates
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'confirmed_at'
  ) then
    alter table public.orders
    add column confirmed_at timestamptz;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'shipped_at'
  ) then
    alter table public.orders
    add column shipped_at timestamptz;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'delivered_at'
  ) then
    alter table public.orders
    add column delivered_at timestamptz;
  end if;

  -- Notes
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'buyer_notes'
  ) then
    alter table public.orders
    add column buyer_notes text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'seller_notes'
  ) then
    alter table public.orders
    add column seller_notes text;
  end if;

  -- Calculate totals if missing
  update public.orders
  set total_amount = coalesce(total_amount, 0)
  where total_amount is null;
  
  -- Note: We don't automatically migrate 'placed' to 'confirmed' here
  -- because enum values must be committed before use, and this migration
  -- should be handled by application logic when orders are confirmed.
end $$;

-- Constraints (idempotent)
do $$
begin
  -- Add shipping cost constraint if it doesn't exist
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_shipping_cost_check'
    and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
    add constraint orders_shipping_cost_check
    check (shipping_cost >= 0);
  end if;

  -- Add tax amount constraint if it doesn't exist
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_tax_amount_check'
    and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
    add constraint orders_tax_amount_check
    check (tax_amount >= 0);
  end if;

  -- Add discount amount constraint if it doesn't exist
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_discount_amount_check'
    and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
    add constraint orders_discount_amount_check
    check (discount_amount >= 0);
  end if;
end $$;

-- Indexes
create index if not exists idx_orders_buyer_id on public.orders(buyer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at_desc on public.orders(created_at desc);

-- Update RLS policies
-- Keep backward compatible policies, add new ones

-- Buyers can read their own orders
drop policy if exists orders_select_buyer on public.orders;
create policy orders_select_buyer
on public.orders
for select
to authenticated
using (
  buyer_id = auth.uid()
  or user_email = (select email from public.user_profiles where id = auth.uid())
);

-- Buyers can create orders
drop policy if exists orders_insert_buyer on public.orders;
create policy orders_insert_buyer
on public.orders
for insert
to authenticated
with check (
  buyer_id = auth.uid()
  or buyer_id is null -- Allow anonymous for backward compatibility
);

-- Sellers can read orders for their products
drop policy if exists orders_select_seller on public.orders;
create policy orders_select_seller
on public.orders
for select
to authenticated
using (
  exists (
    select 1 from public.order_items oi
    join public.products p on oi.product_id = p.id
    join public.seller_profiles sp on p.seller_id = sp.id
    where oi.order_id = orders.id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
);

-- Sellers can update order status (for fulfillment)
drop policy if exists orders_update_seller on public.orders;
create policy orders_update_seller
on public.orders
for update
to authenticated
using (
  exists (
    select 1 from public.order_items oi
    join public.products p on oi.product_id = p.id
    join public.seller_profiles sp on p.seller_id = sp.id
    where oi.order_id = orders.id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.order_items oi
    join public.products p on oi.product_id = p.id
    join public.seller_profiles sp on p.seller_id = sp.id
    where oi.order_id = orders.id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
);

-- Admins have full access
drop policy if exists orders_all_admin on public.orders;
create policy orders_all_admin
on public.orders
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

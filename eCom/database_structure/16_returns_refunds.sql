-- 16_returns_refunds.sql
-- VYAPAR: Returns and refunds management
--
-- Safe to run multiple times.

begin;

-- Return reason enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'return_reason') then
    create type public.return_reason as enum (
      'defective',
      'wrong_item',
      'not_as_described',
      'damaged',
      'size_issue',
      'quality_issue',
      'other'
    );
  end if;
end $$;

-- Return status enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'return_status') then
    create type public.return_status as enum (
      'requested',
      'approved',
      'rejected',
      'pickup_scheduled',
      'picked_up',
      'received',
      'processing_refund',
      'refunded',
      'cancelled'
    );
  end if;
end $$;

-- Returns table
create table if not exists public.returns (
  id uuid primary key default gen_random_uuid(),
  
  order_id uuid not null references public.orders(id) on delete restrict,
  buyer_id uuid not null references public.user_profiles(id) on delete restrict,
  
  -- Return details
  return_reason public.return_reason not null,
  return_reason_details text,
  status public.return_status not null default 'requested',
  
  -- Items to return (JSONB for flexibility)
  items_to_return jsonb not null, -- [{order_item_id, quantity, reason}]
  
  -- Refund information
  refund_amount numeric(12,2),
  refund_method public.payment_method, -- From payments enum
  refund_transaction_id text,
  
  -- Reverse logistics (India Post tracking)
  return_tracking_id text, -- DAKSH tracking ID for return shipment
  
  -- Processing
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references public.user_profiles(id),
  rejected_at timestamptz,
  rejection_reason text,
  picked_up_at timestamptz,
  received_at timestamptz,
  refunded_at timestamptz,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint returns_refund_amount_check check (
    refund_amount is null or refund_amount >= 0
  )
);

-- Indexes
create index if not exists idx_returns_order_id on public.returns(order_id);
create index if not exists idx_returns_buyer_id on public.returns(buyer_id);
create index if not exists idx_returns_status on public.returns(status);
create index if not exists idx_returns_tracking_id on public.returns(return_tracking_id)
  where return_tracking_id is not null;

-- Updated_at trigger
drop trigger if exists update_returns_updated_at on public.returns;
create trigger update_returns_updated_at
  before update on public.returns
  for each row
  execute function public.update_updated_at_column();

-- Enable RLS
alter table public.returns enable row level security;

-- RLS Policies
-- Buyers can read their own returns
drop policy if exists returns_select_buyer on public.returns;
create policy returns_select_buyer
on public.returns
for select
to authenticated
using (buyer_id = auth.uid());

-- Buyers can create return requests for their orders
drop policy if exists returns_insert_buyer on public.returns;
create policy returns_insert_buyer
on public.returns
for insert
to authenticated
with check (
  buyer_id = auth.uid()
  and order_id in (
    select id from public.orders
    where buyer_id = auth.uid()
    and status = 'delivered'
  )
);

-- Sellers can read returns for their orders
drop policy if exists returns_select_seller on public.returns;
create policy returns_select_seller
on public.returns
for select
to authenticated
using (
  exists (
    select 1 from public.orders o
    join public.order_items oi on o.id = oi.order_id
    join public.products p on oi.product_id = p.id
    join public.seller_profiles sp on p.seller_id = sp.id
    where o.id = returns.order_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
);

-- Sellers can update return status (approve/reject)
drop policy if exists returns_update_seller on public.returns;
create policy returns_update_seller
on public.returns
for update
to authenticated
using (
  exists (
    select 1 from public.orders o
    join public.order_items oi on o.id = oi.order_id
    join public.products p on oi.product_id = p.id
    join public.seller_profiles sp on p.seller_id = sp.id
    where o.id = returns.order_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
  and status = 'requested' -- Only pending returns
)
with check (
  exists (
    select 1 from public.orders o
    join public.order_items oi on o.id = oi.order_id
    join public.products p on oi.product_id = p.id
    join public.seller_profiles sp on p.seller_id = sp.id
    where o.id = returns.order_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
);

-- Admins have full access
drop policy if exists returns_all_admin on public.returns;
create policy returns_all_admin
on public.returns
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

-- 13_payments.sql
-- VYAPAR: Payment processing and settlement
--
-- Safe to run multiple times.

begin;

-- Payment method enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum (
      'cod', -- Cash on Delivery
      'upi',
      'card',
      'netbanking',
      'wallet'
    );
  end if;
end $$;

-- Payment status enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum (
      'pending',
      'processing',
      'completed',
      'failed',
      'refunded',
      'partially_refunded'
    );
  end if;
end $$;

-- Payments table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  
  order_id uuid not null references public.orders(id) on delete restrict,
  buyer_id uuid not null references public.user_profiles(id) on delete restrict,
  
  -- Payment details
  payment_method public.payment_method not null,
  amount numeric(12,2) not null,
  currency text not null default 'INR',
  
  -- Gateway information
  gateway_transaction_id text, -- External payment gateway transaction ID
  gateway_response jsonb, -- Full gateway response for audit
  
  -- Status
  status public.payment_status not null default 'pending',
  
  -- Settlement (for sellers)
  is_settled boolean not null default false,
  settled_at timestamptz,
  settlement_amount numeric(12,2), -- After commission deduction
  
  -- Refund information
  refund_amount numeric(12,2) not null default 0.00,
  refund_reason text,
  refunded_at timestamptz,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint payments_amount_check check (amount > 0),
  constraint payments_refund_amount_check check (refund_amount >= 0),
  constraint payments_refund_not_exceed_amount check (refund_amount <= amount),
  constraint payments_settlement_amount_check check (
    settlement_amount is null or settlement_amount >= 0
  )
);

-- Indexes
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_buyer_id on public.payments(buyer_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_gateway_transaction_id on public.payments(gateway_transaction_id)
  where gateway_transaction_id is not null;
create index if not exists idx_payments_settled on public.payments(is_settled, settled_at)
  where is_settled = false;

-- Updated_at trigger
drop trigger if exists update_payments_updated_at on public.payments;
create trigger update_payments_updated_at
  before update on public.payments
  for each row
  execute function public.update_updated_at_column();

-- Enable RLS
alter table public.payments enable row level security;

-- RLS Policies
-- Buyers can read their own payments
drop policy if exists payments_select_buyer on public.payments;
create policy payments_select_buyer
on public.payments
for select
to authenticated
using (buyer_id = auth.uid());

-- Buyers can create payments for their orders
drop policy if exists payments_insert_buyer on public.payments;
create policy payments_insert_buyer
on public.payments
for insert
to authenticated
with check (
  buyer_id = auth.uid()
  and order_id in (
    select id from public.orders where buyer_id = auth.uid()
  )
);

-- Sellers can read payments for their orders
drop policy if exists payments_select_seller on public.payments;
create policy payments_select_seller
on public.payments
for select
to authenticated
using (
  exists (
    select 1 from public.orders o
    join public.order_items oi on o.id = oi.order_id
    join public.products p on oi.product_id = p.id
    join public.seller_profiles sp on p.seller_id = sp.id
    where o.id = payments.order_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
);

-- Admins have full access
drop policy if exists payments_all_admin on public.payments;
create policy payments_all_admin
on public.payments
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

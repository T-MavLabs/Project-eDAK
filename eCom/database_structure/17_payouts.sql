-- 17_payouts.sql
-- VYAPAR: Seller payouts and settlements
--
-- Safe to run multiple times.

begin;

-- Payout status enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payout_status') then
    create type public.payout_status as enum (
      'pending',
      'processing',
      'completed',
      'failed',
      'cancelled'
    );
  end if;
end $$;

-- Payouts table
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  
  seller_id uuid not null references public.seller_profiles(id) on delete restrict,
  
  -- Payout details
  order_id uuid references public.orders(id) on delete restrict, -- Optional: per-order payout
  payment_id uuid references public.payments(id) on delete restrict,
  
  -- Amounts
  gross_amount numeric(12,2) not null, -- Order total
  commission_amount numeric(12,2) not null, -- Platform commission
  tax_amount numeric(12,2) not null default 0.00, -- TDS/GST on payout
  net_amount numeric(12,2) not null, -- Amount to seller (gross - commission - tax)
  
  -- Status
  status public.payout_status not null default 'pending',
  
  -- Settlement
  settlement_date date,
  bank_reference_number text,
  transaction_id text, -- External payment gateway transaction ID
  
  -- Notes
  notes text,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint payouts_gross_amount_check check (gross_amount > 0),
  constraint payouts_commission_amount_check check (commission_amount >= 0),
  constraint payouts_tax_amount_check check (tax_amount >= 0),
  constraint payouts_net_amount_check check (net_amount > 0),
  constraint payouts_amounts_balance check (
    net_amount = gross_amount - commission_amount - tax_amount
  )
);

-- Indexes
create index if not exists idx_payouts_seller_id on public.payouts(seller_id);
create index if not exists idx_payouts_order_id on public.payouts(order_id) where order_id is not null;
create index if not exists idx_payouts_status on public.payouts(status);
create index if not exists idx_payouts_settlement_date on public.payouts(settlement_date)
  where settlement_date is not null;

-- Updated_at trigger
drop trigger if exists update_payouts_updated_at on public.payouts;
create trigger update_payouts_updated_at
  before update on public.payouts
  for each row
  execute function public.update_updated_at_column();

-- Enable RLS
alter table public.payouts enable row level security;

-- RLS Policies
-- Sellers can read their own payouts
drop policy if exists payouts_select_seller on public.payouts;
create policy payouts_select_seller
on public.payouts
for select
to authenticated
using (
  seller_id = (select id from public.user_profiles where id = auth.uid())
);

-- Admins can read all payouts
drop policy if exists payouts_select_admin on public.payouts;
create policy payouts_select_admin
on public.payouts
for select
to authenticated
using (
  exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Admins can create and update payouts
drop policy if exists payouts_all_admin on public.payouts;
create policy payouts_all_admin
on public.payouts
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

-- 02_orders.sql
-- eCom demo: orders table
--
-- Safe to run multiple times.

begin;

DO $$
begin
  if not exists (select 1 from pg_type where typname = 'ecom_order_status') then
    create type public.ecom_order_status as enum ('placed', 'shipped');
  end if;
end $$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),

  user_email text not null,
  total_amount numeric(12,2) not null,
  digipin text not null,

  tracking_id text,
  status public.ecom_order_status not null default 'placed',

  created_at timestamptz not null default now(),

  constraint orders_total_nonneg check (total_amount >= 0),
  constraint orders_email_len check (char_length(user_email) between 3 and 254),
  constraint orders_tracking_len check (tracking_id is null or char_length(tracking_id) between 6 and 32)
);

create index if not exists idx_orders_email_created_at on public.orders(user_email, created_at desc);
create index if not exists idx_orders_tracking_id on public.orders(tracking_id);

alter table public.orders enable row level security;

-- Demo-safe: allow inserts without auth
-- (Hackathon mode: anonymous checkout)
drop policy if exists orders_public_insert on public.orders;
create policy orders_public_insert
on public.orders
for insert
to anon, authenticated
with check (true);

-- Allow reading orders (for demo order history by email)
drop policy if exists orders_public_select on public.orders;
create policy orders_public_select
on public.orders
for select
to anon, authenticated
using (true);

-- Allow updating tracking_id after creation (demo flow)
drop policy if exists orders_public_update_tracking on public.orders;
create policy orders_public_update_tracking
on public.orders
for update
to anon, authenticated
using (true)
with check (true);

commit;

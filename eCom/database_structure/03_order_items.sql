-- 03_order_items.sql
-- eCom demo: order_items table
--
-- Safe to run multiple times.

begin;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),

  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,

  quantity integer not null,
  price_at_purchase numeric(12,2) not null,

  created_at timestamptz not null default now(),

  constraint order_items_qty check (quantity >= 1 and quantity <= 10),
  constraint order_items_price_nonneg check (price_at_purchase >= 0)
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);

alter table public.order_items enable row level security;

-- Insert-only (demo requirement). We still allow select so the UI can display order contents.
drop policy if exists order_items_public_insert on public.order_items;
create policy order_items_public_insert
on public.order_items
for insert
to anon, authenticated
with check (true);

drop policy if exists order_items_public_select on public.order_items;
create policy order_items_public_select
on public.order_items
for select
to anon, authenticated
using (true);

commit;

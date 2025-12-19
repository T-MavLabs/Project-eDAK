-- 15_reviews.sql
-- VYAPAR: Product reviews and ratings
--
-- Safe to run multiple times.

begin;

-- Reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null, -- Link to order (verified purchase)
  buyer_id uuid not null references public.user_profiles(id) on delete cascade,
  
  -- Rating (1-5 stars)
  rating integer not null,
  
  -- Review content
  title text,
  comment text,
  
  -- Moderation
  is_approved boolean not null default false,
  is_flagged boolean not null default false,
  moderation_notes text,
  moderated_by uuid references public.user_profiles(id),
  moderated_at timestamptz,
  
  -- Helpful votes
  helpful_count integer not null default 0,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint reviews_rating_check check (rating >= 1 and rating <= 5),
  constraint reviews_one_per_order unique (order_id, buyer_id) -- One review per order
);

-- Indexes
create index if not exists idx_reviews_product_id on public.reviews(product_id);
create index if not exists idx_reviews_buyer_id on public.reviews(buyer_id);
create index if not exists idx_reviews_is_approved on public.reviews(is_approved)
  where is_approved = true;
create index if not exists idx_reviews_rating on public.reviews(product_id, rating);

-- Updated_at trigger
drop trigger if exists update_reviews_updated_at on public.reviews;
create trigger update_reviews_updated_at
  before update on public.reviews
  for each row
  execute function public.update_updated_at_column();

-- Enable RLS
alter table public.reviews enable row level security;

-- RLS Policies
-- Public can read approved reviews
drop policy if exists reviews_select_public on public.reviews;
create policy reviews_select_public
on public.reviews
for select
to anon, authenticated
using (
  is_approved = true
  and is_flagged = false
);

-- Buyers can read their own reviews (all statuses)
drop policy if exists reviews_select_own on public.reviews;
create policy reviews_select_own
on public.reviews
for select
to authenticated
using (buyer_id = auth.uid());

-- Buyers can create reviews for their orders
drop policy if exists reviews_insert_buyer on public.reviews;
create policy reviews_insert_buyer
on public.reviews
for insert
to authenticated
with check (
  buyer_id = auth.uid()
  and (
    order_id is null
    or order_id in (
      select id from public.orders where buyer_id = auth.uid() and status = 'delivered'
    )
  )
);

-- Buyers can update their own reviews (before approval)
drop policy if exists reviews_update_buyer on public.reviews;
create policy reviews_update_buyer
on public.reviews
for update
to authenticated
using (buyer_id = auth.uid() and is_approved = false)
with check (buyer_id = auth.uid());

-- Sellers can read reviews for their products
drop policy if exists reviews_select_seller on public.reviews;
create policy reviews_select_seller
on public.reviews
for select
to authenticated
using (
  exists (
    select 1 from public.products p
    join public.seller_profiles sp on p.seller_id = sp.id
    where p.id = reviews.product_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  )
);

-- Admins can read all reviews and moderate
drop policy if exists reviews_all_admin on public.reviews;
create policy reviews_all_admin
on public.reviews
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

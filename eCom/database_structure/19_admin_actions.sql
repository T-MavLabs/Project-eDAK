-- 19_admin_actions.sql
-- VYAPAR: Admin moderation and action logs
--
-- Safe to run multiple times.

begin;

-- Admin action type enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'admin_action_type') then
    create type public.admin_action_type as enum (
      'product_approve',
      'product_reject',
      'product_archive',
      'seller_verify',
      'seller_reject',
      'seller_suspend',
      'seller_unsuspend',
      'order_cancel',
      'order_refund',
      'review_approve',
      'review_reject',
      'review_delete',
      'user_ban',
      'user_unban',
      'user_role_change'
    );
  end if;
end $$;

-- Admin actions table (audit log)
create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  
  admin_id uuid not null references public.user_profiles(id) on delete restrict,
  
  -- Action details
  action_type public.admin_action_type not null,
  target_type text not null, -- 'product', 'seller', 'order', 'review', 'user'
  target_id uuid not null, -- ID of the target entity
  
  -- Action data
  action_data jsonb, -- Additional context (reason, notes, etc.)
  previous_state jsonb, -- State before action (for audit)
  new_state jsonb, -- State after action
  
  -- IP and user agent (for security)
  ip_address inet,
  user_agent text,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  
  -- Constraints
  constraint admin_actions_target_type_check check (
    target_type in ('product', 'seller', 'order', 'review', 'user', 'payment', 'return')
  )
);

-- Indexes
create index if not exists idx_admin_actions_admin_id on public.admin_actions(admin_id);
create index if not exists idx_admin_actions_type on public.admin_actions(action_type);
create index if not exists idx_admin_actions_target on public.admin_actions(target_type, target_id);
create index if not exists idx_admin_actions_created_at_desc on public.admin_actions(created_at desc);

-- Enable RLS
alter table public.admin_actions enable row level security;

-- RLS Policies
-- Admins can read all admin actions
drop policy if exists admin_actions_select_admin on public.admin_actions;
create policy admin_actions_select_admin
on public.admin_actions
for select
to authenticated
using (
  exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Admins can insert their own actions
drop policy if exists admin_actions_insert_admin on public.admin_actions;
create policy admin_actions_insert_admin
on public.admin_actions
for insert
to authenticated
with check (
  admin_id = auth.uid()
  and exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Users can read actions related to their entities (limited)
drop policy if exists admin_actions_select_own on public.admin_actions;
create policy admin_actions_select_own
on public.admin_actions
for select
to authenticated
using (
  -- Users can see actions on their products
  (target_type = 'product' and exists (
    select 1 from public.products p
    join public.seller_profiles sp on p.seller_id = sp.id
    where p.id = admin_actions.target_id
    and sp.id = (select id from public.user_profiles where id = auth.uid())
  ))
  or
  -- Users can see actions on their orders
  (target_type = 'order' and exists (
    select 1 from public.orders
    where id = admin_actions.target_id
    and buyer_id = auth.uid()
  ))
  or
  -- Users can see actions on their reviews
  (target_type = 'review' and exists (
    select 1 from public.reviews
    where id = admin_actions.target_id
    and buyer_id = auth.uid()
  ))
  or
  -- Users can see actions on themselves
  (target_type = 'user' and target_id = auth.uid())
);

-- Prevent updates and deletes (append-only audit log)
-- No update/delete policies needed - RLS will block by default

commit;

-- 18_notifications.sql
-- VYAPAR: User notifications system
--
-- Safe to run multiple times.

begin;

-- Notification type enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum (
      'order_placed',
      'order_confirmed',
      'order_shipped',
      'order_delivered',
      'order_cancelled',
      'payment_success',
      'payment_failed',
      'return_requested',
      'return_approved',
      'return_rejected',
      'payout_processed',
      'product_approved',
      'product_rejected',
      'seller_verified',
      'seller_suspended',
      'system_announcement'
    );
  end if;
end $$;

-- Notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  
  -- Notification details
  type public.notification_type not null,
  title text not null,
  message text not null,
  
  -- Related entities (optional)
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete cascade,
  
  -- Status
  is_read boolean not null default false,
  read_at timestamptz,
  
  -- Action link (optional)
  action_url text,
  action_label text,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  
  -- Constraints
  constraint notifications_message_length check (char_length(message) <= 1000)
);

-- Indexes
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_user_unread on public.notifications(user_id, is_read, created_at desc)
  where is_read = false;
create index if not exists idx_notifications_type on public.notifications(type);
create index if not exists idx_notifications_created_at_desc on public.notifications(created_at desc);

-- Function to mark notification as read
create or replace function public.mark_notification_read(p_notification_id uuid)
returns void as $$
begin
  update public.notifications
  set is_read = true, read_at = now()
  where id = p_notification_id
    and user_id = auth.uid();
end;
$$ language plpgsql security definer;

-- Enable RLS
alter table public.notifications enable row level security;

-- RLS Policies
-- Users can read their own notifications
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- System can insert notifications (via service role or triggers)
-- Note: In production, use service role for inserts
drop policy if exists notifications_insert_system on public.notifications;
create policy notifications_insert_system
on public.notifications
for insert
to authenticated
with check (true); -- Will be restricted by application logic

-- Admins can read all notifications
drop policy if exists notifications_select_admin on public.notifications;
create policy notifications_select_admin
on public.notifications
for select
to authenticated
using (
  exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  )
);

commit;

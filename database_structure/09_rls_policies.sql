-- 09_rls_policies.sql
-- Row Level Security policies for Supabase.
--
-- Goals:
-- - Secure-by-default.
-- - Customers: read their own parcels + complaints.
-- - Delivery agents: read parcels assigned to their hub.
-- - Post admins: full read/write.
-- - Regional admins: region-scoped read.
-- - Audit logs: read-only for non-admin; write allowed only for admins/services.
--
-- Safe to run multiple times.

begin;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.parcels enable row level security;
alter table public.parcel_events enable row level security;
alter table public.delivery_predictions enable row level security;
alter table public.complaints enable row level security;
alter table public.delivery_analytics enable row level security;
alter table public.audit_logs enable row level security;

-- -----------------------------
-- PROFILES
-- -----------------------------

-- Customers can read their own profile
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- Users can update their own profile (limited by column-level privileges you grant later)
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Admins can read all profiles
drop policy if exists profiles_admin_select_all on public.profiles;
create policy profiles_admin_select_all
on public.profiles
for select
to authenticated
using (public.is_post_admin());

-- -----------------------------
-- PARCELS
-- -----------------------------

-- Customers can read parcels where they are sender/receiver
drop policy if exists parcels_customer_select_own on public.parcels;
create policy parcels_customer_select_own
on public.parcels
for select
to authenticated
using (
  sender_user_id = auth.uid()
  or receiver_user_id = auth.uid()
);

-- Delivery agents can read parcels assigned to their hub
drop policy if exists parcels_agent_select_hub on public.parcels;
create policy parcels_agent_select_hub
on public.parcels
for select
to authenticated
using (
  public.is_delivery_agent()
  and public.current_hub_code() is not null
  and current_hub_code = public.current_hub_code()
);

-- Regional admins can read parcels scoped to their region
drop policy if exists parcels_regional_select_region on public.parcels;
create policy parcels_regional_select_region
on public.parcels
for select
to authenticated
using (
  public.is_regional_admin()
  and public.current_region_code() is not null
  and (
    current_region_code = public.current_region_code()
    or origin_region_code = public.current_region_code()
    or destination_region_code = public.current_region_code()
  )
);

-- Post admins full access
drop policy if exists parcels_admin_all on public.parcels;
create policy parcels_admin_all
on public.parcels
for all
to authenticated
using (public.is_post_admin())
with check (public.is_post_admin());

-- -----------------------------
-- PARCEL EVENTS
-- -----------------------------

-- Customers can read events for their parcels
drop policy if exists parcel_events_customer_select_own on public.parcel_events;
create policy parcel_events_customer_select_own
on public.parcel_events
for select
to authenticated
using (
  exists (
    select 1
    from public.parcels p
    where p.id = parcel_events.parcel_id
      and (p.sender_user_id = auth.uid() or p.receiver_user_id = auth.uid())
  )
);

-- Delivery agents can read events for hub-assigned parcels
drop policy if exists parcel_events_agent_select_hub on public.parcel_events;
create policy parcel_events_agent_select_hub
on public.parcel_events
for select
to authenticated
using (
  public.is_delivery_agent()
  and public.current_hub_code() is not null
  and hub_code = public.current_hub_code()
);

-- Regional admins can read events in their region
drop policy if exists parcel_events_regional_select_region on public.parcel_events;
create policy parcel_events_regional_select_region
on public.parcel_events
for select
to authenticated
using (
  public.is_regional_admin()
  and public.current_region_code() is not null
  and region_code = public.current_region_code()
);

-- Post admins full access to events
drop policy if exists parcel_events_admin_all on public.parcel_events;
create policy parcel_events_admin_all
on public.parcel_events
for all
to authenticated
using (public.is_post_admin())
with check (public.is_post_admin());

-- -----------------------------
-- DELIVERY PREDICTIONS
-- -----------------------------

-- Customers can read predictions for their parcels
drop policy if exists delivery_predictions_customer_select_own on public.delivery_predictions;
create policy delivery_predictions_customer_select_own
on public.delivery_predictions
for select
to authenticated
using (
  exists (
    select 1
    from public.parcels p
    where p.id = delivery_predictions.parcel_id
      and (p.sender_user_id = auth.uid() or p.receiver_user_id = auth.uid())
  )
);

-- Delivery agents can read predictions for their hub parcels
drop policy if exists delivery_predictions_agent_select_hub on public.delivery_predictions;
create policy delivery_predictions_agent_select_hub
on public.delivery_predictions
for select
to authenticated
using (
  public.is_delivery_agent()
  and public.current_hub_code() is not null
  and exists (
    select 1
    from public.parcels p
    where p.id = delivery_predictions.parcel_id
      and p.current_hub_code = public.current_hub_code()
  )
);

-- Regional admins can read predictions for their region parcels
drop policy if exists delivery_predictions_regional_select_region on public.delivery_predictions;
create policy delivery_predictions_regional_select_region
on public.delivery_predictions
for select
to authenticated
using (
  public.is_regional_admin()
  and public.current_region_code() is not null
  and exists (
    select 1
    from public.parcels p
    where p.id = delivery_predictions.parcel_id
      and (
        p.current_region_code = public.current_region_code()
        or p.origin_region_code = public.current_region_code()
        or p.destination_region_code = public.current_region_code()
      )
  )
);

-- Post admins full access
drop policy if exists delivery_predictions_admin_all on public.delivery_predictions;
create policy delivery_predictions_admin_all
on public.delivery_predictions
for all
to authenticated
using (public.is_post_admin())
with check (public.is_post_admin());

-- -----------------------------
-- COMPLAINTS
-- -----------------------------

-- Customers can read their own complaints
drop policy if exists complaints_customer_select_own on public.complaints;
create policy complaints_customer_select_own
on public.complaints
for select
to authenticated
using (user_id = auth.uid());

-- Customers can create complaints only for their parcels
drop policy if exists complaints_customer_insert_own_parcel on public.complaints;
create policy complaints_customer_insert_own_parcel
on public.complaints
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.parcels p
    where p.id = complaints.parcel_id
      and (p.sender_user_id = auth.uid() or p.receiver_user_id = auth.uid())
  )
);

-- Delivery agents can read complaints for their hub parcels
drop policy if exists complaints_agent_select_hub on public.complaints;
create policy complaints_agent_select_hub
on public.complaints
for select
to authenticated
using (
  public.is_delivery_agent()
  and public.current_hub_code() is not null
  and exists (
    select 1
    from public.parcels p
    where p.id = complaints.parcel_id
      and p.current_hub_code = public.current_hub_code()
  )
);

-- Regional admins can read complaints scoped to region
drop policy if exists complaints_regional_select_region on public.complaints;
create policy complaints_regional_select_region
on public.complaints
for select
to authenticated
using (
  public.is_regional_admin()
  and public.current_region_code() is not null
  and exists (
    select 1
    from public.parcels p
    where p.id = complaints.parcel_id
      and (
        p.current_region_code = public.current_region_code()
        or p.origin_region_code = public.current_region_code()
        or p.destination_region_code = public.current_region_code()
      )
  )
);

-- Post admins full access
drop policy if exists complaints_admin_all on public.complaints;
create policy complaints_admin_all
on public.complaints
for all
to authenticated
using (public.is_post_admin())
with check (public.is_post_admin());

-- -----------------------------
-- DELIVERY ANALYTICS
-- -----------------------------

-- Regional admins can read analytics in their region
drop policy if exists delivery_analytics_regional_select_region on public.delivery_analytics;
create policy delivery_analytics_regional_select_region
on public.delivery_analytics
for select
to authenticated
using (
  public.is_regional_admin()
  and public.current_region_code() is not null
  and region_code = public.current_region_code()
);

-- Post admins can read/write all analytics snapshots
drop policy if exists delivery_analytics_admin_all on public.delivery_analytics;
create policy delivery_analytics_admin_all
on public.delivery_analytics
for all
to authenticated
using (public.is_post_admin())
with check (public.is_post_admin());

-- -----------------------------
-- AUDIT LOGS
-- -----------------------------

-- Non-admin roles: read-only
drop policy if exists audit_logs_select_authenticated on public.audit_logs;
create policy audit_logs_select_authenticated
on public.audit_logs
for select
to authenticated
using (true);

-- Only post_admin can insert audit logs (service role can bypass RLS in Supabase).
drop policy if exists audit_logs_admin_insert on public.audit_logs;
create policy audit_logs_admin_insert
on public.audit_logs
for insert
to authenticated
with check (public.is_post_admin());

-- No update/delete policies are created (table trigger blocks mutations anyway).

commit;

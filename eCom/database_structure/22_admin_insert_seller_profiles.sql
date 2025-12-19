-- 22_admin_insert_seller_profiles.sql
-- VYAPAR: Allow admins to insert seller_profiles
--
-- This allows admins to create seller profiles for sellers who haven't
-- completed onboarding, enabling admin verification/rejection workflow.
--
-- Safe to run multiple times.

begin;

-- Admins can insert seller profiles (for creating profiles for sellers who haven't completed onboarding)
drop policy if exists seller_profiles_insert_admin on public.seller_profiles;
create policy seller_profiles_insert_admin
on public.seller_profiles
for insert
to authenticated
with check (public.is_user_admin());

commit;

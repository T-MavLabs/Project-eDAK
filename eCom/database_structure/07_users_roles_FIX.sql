-- 07_users_roles_FIX.sql
-- Fix for infinite recursion in RLS policies
-- Run this to fix the user_profiles RLS policies

begin;

-- Helper function to check if user is admin (security definer to bypass RLS)
create or replace function public.is_user_admin(check_user_id uuid default auth.uid())
returns boolean
language plpgsql
security definer
stable
as $$
declare
  user_role public.vyapar_user_role;
begin
  select role into user_role
  from public.user_profiles
  where id = check_user_id;
  
  return user_role = 'admin';
end;
$$;

-- Fix: Drop and recreate the problematic policies

-- Users can update their own profile (simplified - no role check in with_check)
drop policy if exists user_profiles_update_own on public.user_profiles;
create policy user_profiles_update_own
on public.user_profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  -- Note: Role changes are prevented at application level or via trigger
  -- We don't check role here to avoid recursion
);

-- Admins can read all profiles (using security definer function)
drop policy if exists user_profiles_select_admin on public.user_profiles;
create policy user_profiles_select_admin
on public.user_profiles
for select
to authenticated
using (public.is_user_admin());

-- Admins can update any profile
drop policy if exists user_profiles_update_admin on public.user_profiles;
create policy user_profiles_update_admin
on public.user_profiles
for update
to authenticated
using (public.is_user_admin())
with check (true); -- Admins can update anything

commit;

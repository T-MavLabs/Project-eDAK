-- 21_fix_signup_role.sql
-- VYAPAR: Fix signup role assignment
--
-- This script fixes the issue where users signing up as sellers
-- are being assigned the default 'buyer' role due to the trigger.
--
-- Safe to run multiple times.

begin;

-- Update the sync_user_profile_email function to read role from metadata
create or replace function public.sync_user_profile_email()
returns trigger as $$
declare
  user_role text;
begin
  -- Try to get role from metadata, default to 'buyer' if not found
  user_role := coalesce(
    new.raw_user_meta_data->>'role',
    'buyer'
  );
  
  -- Ensure role is valid
  if user_role not in ('buyer', 'seller', 'admin') then
    user_role := 'buyer';
  end if;
  
  insert into public.user_profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    user_role::public.vyapar_user_role
  )
  on conflict (id) do update
  set email = new.email,
      full_name = coalesce(new.raw_user_meta_data->>'full_name', user_profiles.full_name),
      updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Create a function to allow users to set their own role during signup
-- (only works if the profile was just created and role is still 'buyer')
create or replace function public.set_initial_user_role(
  target_user_id uuid,
  new_role text
)
returns boolean
language plpgsql
security definer
as $$
declare
  current_role public.vyapar_user_role;
  profile_created_at timestamptz;
begin
  -- Only allow if user is setting their own role
  if target_user_id != auth.uid() then
    raise exception 'Users can only set their own role';
  end if;
  
  -- Get current role and creation time
  select role, created_at into current_role, profile_created_at
  from public.user_profiles
  where id = target_user_id;
  
  -- Only allow if:
  -- 1. Current role is 'buyer' (default)
  -- 2. Profile was created recently (within 5 minutes of signup)
  -- 3. New role is 'seller' (we don't allow self-promotion to admin)
  if current_role != 'buyer' then
    raise exception 'Role can only be set during initial signup';
  end if;
  
  if new_role not in ('buyer', 'seller') then
    raise exception 'Invalid role. Only buyer or seller roles can be set during signup';
  end if;
  
  if profile_created_at < now() - interval '5 minutes' then
    raise exception 'Role can only be set within 5 minutes of account creation';
  end if;
  
  -- Update the role
  update public.user_profiles
  set role = new_role::public.vyapar_user_role
  where id = target_user_id;
  
  return true;
end;
$$;

commit;

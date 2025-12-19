-- 07_users_roles.sql
-- VYAPAR: User profiles and role management
--
-- Extends Supabase auth.users with marketplace roles
-- Safe to run multiple times.

begin;

-- User role enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'vyapar_user_role') then
    create type public.vyapar_user_role as enum ('buyer', 'seller', 'admin');
  end if;
end $$;

-- User profiles table (1:1 with auth.users)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  
  -- Role-based access
  role public.vyapar_user_role not null default 'buyer',
  
  -- Profile information
  full_name text,
  phone text,
  avatar_url text,
  
  -- Metadata
  email text, -- Denormalized from auth.users for easier queries
  is_verified boolean not null default false,
  is_active boolean not null default true,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint user_profiles_phone_format check (
    phone is null or phone ~ '^[0-9]{10}$'
  ),
  constraint user_profiles_email_format check (
    email is null or email ~ '^[^@]+@[^@]+\.[^@]+$'
  )
);

-- Indexes
create index if not exists idx_user_profiles_role on public.user_profiles(role);
create index if not exists idx_user_profiles_email on public.user_profiles(email);
create index if not exists idx_user_profiles_is_active on public.user_profiles(is_active);

-- Updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Helper function to check if user is admin (security definer to bypass RLS)
-- This prevents infinite recursion in RLS policies
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

drop trigger if exists update_user_profiles_updated_at on public.user_profiles;
create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function public.update_updated_at_column();

-- Prevent role changes via trigger (only admins can change roles via application logic)
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only allow role change if user is admin (checked via function)
  if old.role != new.role and not public.is_user_admin() then
    raise exception 'Role changes are not allowed. Only admins can modify user roles.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_user_role_change on public.user_profiles;
create trigger prevent_user_role_change
  before update on public.user_profiles
  for each row
  when (old.role is distinct from new.role)
  execute function public.prevent_role_change();

-- Prevent role changes via trigger (only admins can change roles via application logic)
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only allow role change if user is admin (checked via function)
  if old.role != new.role and not public.is_user_admin() then
    raise exception 'Role changes are not allowed. Only admins can modify user roles.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_user_role_change on public.user_profiles;
create trigger prevent_user_role_change
  before update on public.user_profiles
  for each row
  when (old.role is distinct from new.role)
  execute function public.prevent_role_change();

-- Sync email from auth.users on insert
create or replace function public.sync_user_profile_email()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
  set email = new.email,
      updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_sync_profile on auth.users;
create trigger on_auth_user_created_sync_profile
  after insert on auth.users
  for each row
  execute function public.sync_user_profile_email();

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Note: The is_user_admin() function is defined above to prevent infinite recursion

-- RLS Policies
-- Users can read their own profile
drop policy if exists user_profiles_select_own on public.user_profiles;
create policy user_profiles_select_own
on public.user_profiles
for select
to authenticated
using (auth.uid() = id);

-- Users can update their own profile (simplified - no recursive role check)
drop policy if exists user_profiles_update_own on public.user_profiles;
create policy user_profiles_update_own
on public.user_profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  -- Note: Role changes are prevented at application level
  -- We don't check role here to avoid infinite recursion
);

-- Public read for active profiles (for seller pages, etc.)
drop policy if exists user_profiles_select_public on public.user_profiles;
create policy user_profiles_select_public
on public.user_profiles
for select
to anon, authenticated
using (is_active = true);

-- Admins can read all profiles (using security definer function to avoid recursion)
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

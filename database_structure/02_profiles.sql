-- 02_profiles.sql
-- Profiles (RBAC) linked to auth.users.
--
-- Assumptions:
-- - Supabase Auth is enabled (auth.users exists).
-- - Roles map to India Post platform needs.
--
-- Safe to run multiple times.

begin;

-- 1) Role enum (RBAC)
DO $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum (
      'customer',
      'delivery_agent',
      'post_admin',
      'regional_admin'
    );
  end if;
end $$;

-- 2) Profiles table (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text,
  phone text,

  -- RBAC role
  role public.user_role not null default 'customer',

  -- India context fields
  digipin text,

  -- Operational scoping
  hub_code text,              -- for delivery agents (current assignment)
  region_code text,           -- for regional admins (e.g., "NCR", "UP-WEST")

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_phone_len check (phone is null or char_length(phone) between 8 and 20),
  constraint profiles_digipin_len check (digipin is null or char_length(digipin) between 6 and 32),
  constraint profiles_region_len check (region_code is null or char_length(region_code) between 2 and 32),
  constraint profiles_hub_len check (hub_code is null or char_length(hub_code) between 2 and 32)
);

comment on table public.profiles is 'User profile + RBAC claims for the India Post Smart Parcel Platform (linked to auth.users).';
comment on column public.profiles.role is 'RBAC role: customer, delivery_agent, post_admin, regional_admin.';
comment on column public.profiles.digipin is 'DIGIPIN associated with a user where applicable (addresses, operational assignment).';
comment on column public.profiles.hub_code is 'Hub assignment for delivery agents (used for RLS scoping).';
comment on column public.profiles.region_code is 'Region assignment for regional admins (used for RLS scoping).';

-- 3) Update timestamp trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- 4) Helper functions for RLS (secure-by-default)
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
as $$
  select coalesce((select p.role from public.profiles p where p.id = auth.uid()), 'customer'::public.user_role);
$$;

create or replace function public.is_post_admin()
returns boolean
language sql
stable
as $$
  select public.current_user_role() = 'post_admin'::public.user_role;
$$;

create or replace function public.is_regional_admin()
returns boolean
language sql
stable
as $$
  select public.current_user_role() = 'regional_admin'::public.user_role;
$$;

create or replace function public.is_delivery_agent()
returns boolean
language sql
stable
as $$
  select public.current_user_role() = 'delivery_agent'::public.user_role;
$$;

create or replace function public.current_hub_code()
returns text
language sql
stable
as $$
  select (select p.hub_code from public.profiles p where p.id = auth.uid());
$$;

create or replace function public.current_region_code()
returns text
language sql
stable
as $$
  select (select p.region_code from public.profiles p where p.id = auth.uid());
$$;

commit;

-- 14_addresses.sql
-- VYAPAR: User address book
--
-- Safe to run multiple times.

begin;

-- Address type enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'address_type') then
    create type public.address_type as enum ('home', 'work', 'other');
  end if;
end $$;

-- Addresses table
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  
  -- Address type
  address_type public.address_type not null default 'home',
  is_default boolean not null default false,
  
  -- Contact information
  full_name text not null,
  phone text not null,
  alternate_phone text,
  
  -- Address details
  address_line1 text not null,
  address_line2 text,
  landmark text,
  city text not null,
  state text not null,
  pincode text not null,
  country text not null default 'India',
  
  -- India Post DIGIPIN
  digipin text,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint addresses_phone_format check (phone ~ '^[0-9]{10}$'),
  constraint addresses_alternate_phone_format check (
    alternate_phone is null or alternate_phone ~ '^[0-9]{10}$'
  ),
  constraint addresses_pincode_format check (pincode ~ '^[0-9]{6}$')
);

-- Indexes
create index if not exists idx_addresses_user_id on public.addresses(user_id);
create index if not exists idx_addresses_user_default on public.addresses(user_id, is_default)
  where is_default = true;

-- Updated_at trigger
drop trigger if exists update_addresses_updated_at on public.addresses;
create trigger update_addresses_updated_at
  before update on public.addresses
  for each row
  execute function public.update_updated_at_column();

-- Function to ensure only one default address per user
create or replace function public.ensure_single_default_address()
returns trigger as $$
begin
  if new.is_default = true then
    -- Unset other default addresses for this user
    update public.addresses
    set is_default = false
    where user_id = new.user_id
      and id != new.id
      and is_default = true;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists ensure_single_default_address_trigger on public.addresses;
create trigger ensure_single_default_address_trigger
  before insert or update on public.addresses
  for each row
  execute function public.ensure_single_default_address();

-- Enable RLS
alter table public.addresses enable row level security;

-- RLS Policies
-- Users can read their own addresses
drop policy if exists addresses_select_own on public.addresses;
create policy addresses_select_own
on public.addresses
for select
to authenticated
using (user_id = auth.uid());

-- Users can insert their own addresses
drop policy if exists addresses_insert_own on public.addresses;
create policy addresses_insert_own
on public.addresses
for insert
to authenticated
with check (user_id = auth.uid());

-- Users can update their own addresses
drop policy if exists addresses_update_own on public.addresses;
create policy addresses_update_own
on public.addresses
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Users can delete their own addresses
drop policy if exists addresses_delete_own on public.addresses;
create policy addresses_delete_own
on public.addresses
for delete
to authenticated
using (user_id = auth.uid());

-- Admins can read all addresses
drop policy if exists addresses_select_admin on public.addresses;
create policy addresses_select_admin
on public.addresses
for select
to authenticated
using (
  exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  )
);

commit;

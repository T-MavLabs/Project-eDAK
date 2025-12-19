-- 08_sellers.sql
-- VYAPAR: Seller (MSME) onboarding and profiles
--
-- Safe to run multiple times.
-- NOTE: Requires is_user_admin() function from 07_users_roles.sql

begin;

-- Seller verification status
do $$
begin
  if not exists (select 1 from pg_type where typname = 'seller_verification_status') then
    create type public.seller_verification_status as enum (
      'pending',
      'under_review',
      'verified',
      'rejected',
      'suspended'
    );
  end if;
end $$;

-- Seller profiles table
create table if not exists public.seller_profiles (
  id uuid primary key references public.user_profiles(id) on delete cascade,
  
  -- Business information
  business_name text not null,
  business_type text, -- 'sole_proprietorship', 'partnership', 'llp', 'private_limited', etc.
  gstin text, -- GST Identification Number
  pan text, -- Permanent Account Number
  
  -- Business address
  business_address_line1 text not null,
  business_address_line2 text,
  business_city text not null,
  business_state text not null,
  business_pincode text not null,
  business_digipin text, -- India Post DIGIPIN
  
  -- Contact information
  business_phone text not null,
  business_email text,
  website text,
  
  -- Verification
  verification_status public.seller_verification_status not null default 'pending',
  verification_notes text, -- Admin notes on verification
  verified_at timestamptz,
  verified_by uuid references public.user_profiles(id), -- Admin who verified
  
  -- Bank details (for payouts)
  bank_account_number text,
  bank_ifsc text,
  bank_account_holder_name text,
  
  -- KYC documents (stored in Supabase Storage)
  pan_document_path text, -- Storage path
  gst_certificate_path text,
  business_license_path text,
  address_proof_path text,
  
  -- Operational
  is_active boolean not null default true,
  commission_rate numeric(5,2) not null default 5.00, -- Platform commission %
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint seller_profiles_gstin_format check (
    gstin is null or gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
  ),
  constraint seller_profiles_pan_format check (
    pan is null or pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
  ),
  constraint seller_profiles_pincode_format check (
    business_pincode ~ '^[0-9]{6}$'
  ),
  constraint seller_profiles_commission_rate check (
    commission_rate >= 0 and commission_rate <= 100
  )
);

-- Indexes
create index if not exists idx_seller_profiles_status on public.seller_profiles(verification_status);
create index if not exists idx_seller_profiles_is_active on public.seller_profiles(is_active);
create index if not exists idx_seller_profiles_gstin on public.seller_profiles(gstin) where gstin is not null;

-- Updated_at trigger
drop trigger if exists update_seller_profiles_updated_at on public.seller_profiles;
create trigger update_seller_profiles_updated_at
  before update on public.seller_profiles
  for each row
  execute function public.update_updated_at_column();

-- Enable RLS
alter table public.seller_profiles enable row level security;

-- RLS Policies
-- Sellers can insert their own profile (during onboarding)
drop policy if exists seller_profiles_insert_own on public.seller_profiles;
create policy seller_profiles_insert_own
on public.seller_profiles
for insert
to authenticated
with check (auth.uid() = id);

-- Sellers can read/update their own profile
drop policy if exists seller_profiles_select_own on public.seller_profiles;
create policy seller_profiles_select_own
on public.seller_profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists seller_profiles_update_own on public.seller_profiles;
create policy seller_profiles_update_own
on public.seller_profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  -- Note: Verification status changes are prevented at application level
  -- We don't check status here to avoid recursion issues
);

-- Public can read verified sellers (for product pages)
drop policy if exists seller_profiles_select_public on public.seller_profiles;
create policy seller_profiles_select_public
on public.seller_profiles
for select
to anon, authenticated
using (
  is_active = true
  and verification_status = 'verified'
);

-- Admins can read all seller profiles (using security definer function to avoid recursion)
drop policy if exists seller_profiles_select_admin on public.seller_profiles;
create policy seller_profiles_select_admin
on public.seller_profiles
for select
to authenticated
using (public.is_user_admin());

-- Admins can update seller profiles (for verification)
drop policy if exists seller_profiles_update_admin on public.seller_profiles;
create policy seller_profiles_update_admin
on public.seller_profiles
for update
to authenticated
using (public.is_user_admin())
with check (public.is_user_admin());

commit;

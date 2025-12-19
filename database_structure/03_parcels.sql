-- 03_parcels.sql
-- Parcels: public tracking_id, ownership, routing, and current state.
--
-- Safe to run multiple times.

begin;

-- Status enum for parcel lifecycle
DO $$
begin
  if not exists (select 1 from pg_type where typname = 'parcel_status') then
    create type public.parcel_status as enum (
      'created',
      'picked_up',
      'in_transit',
      'at_hub',
      'out_for_delivery',
      'delivered',
      'failed_delivery',
      'returned',
      'cancelled'
    );
  end if;
end $$;

create table if not exists public.parcels (
  id uuid primary key default gen_random_uuid(),

  -- Public-facing identifier used by external e-commerce integrations
  tracking_id text not null unique,

  -- Parties (customers)
  sender_user_id uuid references public.profiles(id) on delete set null,
  receiver_user_id uuid references public.profiles(id) on delete set null,

  -- Address intelligence
  origin_digipin text not null,
  destination_digipin text not null,

  -- Optional region codes for admin scoping & analytics
  origin_region_code text,
  destination_region_code text,

  -- Operational routing
  current_hub_code text,
  current_region_code text,

  status public.parcel_status not null default 'created',

  expected_delivery_date date,
  delivered_at timestamptz,

  -- Audit timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- basic validation
  constraint parcels_tracking_id_len check (char_length(tracking_id) between 6 and 32),
  constraint parcels_origin_digipin_len check (char_length(origin_digipin) between 6 and 32),
  constraint parcels_destination_digipin_len check (char_length(destination_digipin) between 6 and 32)
);

create index if not exists idx_parcels_sender_user_id on public.parcels(sender_user_id);
create index if not exists idx_parcels_receiver_user_id on public.parcels(receiver_user_id);
create index if not exists idx_parcels_status on public.parcels(status);
create index if not exists idx_parcels_current_hub_code on public.parcels(current_hub_code);
create index if not exists idx_parcels_current_region_code on public.parcels(current_region_code);

comment on table public.parcels is 'Parcel master record. tracking_id is public & used for external integrations.';
comment on column public.parcels.tracking_id is 'Public tracking identifier exposed to customers and partner e-commerce platforms.';
comment on column public.parcels.current_hub_code is 'Hub currently responsible for this parcel (used for delivery-agent scoping).';

-- updated_at trigger
drop trigger if exists trg_parcels_set_updated_at on public.parcels;
create trigger trg_parcels_set_updated_at
before update on public.parcels
for each row
execute function public.set_updated_at();

commit;

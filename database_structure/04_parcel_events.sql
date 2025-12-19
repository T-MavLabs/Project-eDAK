-- 04_parcel_events.sql
-- Parcel events: full parcel status history, hub-level timeline.
--
-- Safe to run multiple times.

begin;

create table if not exists public.parcel_events (
  id uuid primary key default gen_random_uuid(),

  parcel_id uuid not null references public.parcels(id) on delete cascade,

  -- Mirror key for convenience when partners only know tracking_id
  tracking_id text not null,

  event_time timestamptz not null default now(),

  -- Operational details
  hub_code text,
  region_code text,

  status public.parcel_status not null,

  -- freeform info (scan notes, reason codes)
  message text,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  constraint parcel_events_tracking_id_len check (char_length(tracking_id) between 6 and 32)
);

create index if not exists idx_parcel_events_parcel_id_time on public.parcel_events(parcel_id, event_time desc);
create index if not exists idx_parcel_events_tracking_id_time on public.parcel_events(tracking_id, event_time desc);
create index if not exists idx_parcel_events_hub_code_time on public.parcel_events(hub_code, event_time desc);

comment on table public.parcel_events is 'Append-only timeline of parcel status + hub-level events.';

-- Keep parcel_events.tracking_id consistent with parcels.tracking_id
create or replace function public.sync_parcel_event_tracking_id()
returns trigger
language plpgsql
as $$
begin
  if new.tracking_id is null or new.tracking_id = '' then
    select p.tracking_id into new.tracking_id
    from public.parcels p
    where p.id = new.parcel_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_parcel_events_sync_tracking_id on public.parcel_events;
create trigger trg_parcel_events_sync_tracking_id
before insert on public.parcel_events
for each row
execute function public.sync_parcel_event_tracking_id();

commit;

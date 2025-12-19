-- 06_complaints.sql
-- Complaints: linked to parcel + user, AI classification, resolution lifecycle.
--
-- Safe to run multiple times.

begin;

DO $$
begin
  if not exists (select 1 from pg_type where typname = 'complaint_severity') then
    create type public.complaint_severity as enum ('low', 'medium', 'high', 'critical');
  end if;
  if not exists (select 1 from pg_type where typname = 'complaint_status') then
    create type public.complaint_status as enum ('open', 'in_review', 'resolved', 'rejected');
  end if;
end $$;

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),

  parcel_id uuid not null references public.parcels(id) on delete cascade,
  tracking_id text not null,

  user_id uuid not null references public.profiles(id) on delete cascade,

  complaint_text text not null,

  -- AI/ML outputs (stored for auditability)
  ai_category text,
  ai_confidence numeric(5,4),

  severity public.complaint_severity not null default 'medium',
  status public.complaint_status not null default 'open',

  resolution_notes text,
  resolved_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint complaints_ai_confidence_range check (ai_confidence is null or (ai_confidence >= 0 and ai_confidence <= 1)),
  constraint complaints_tracking_id_len check (char_length(tracking_id) between 6 and 32)
);

create index if not exists idx_complaints_user_id_created_at on public.complaints(user_id, created_at desc);
create index if not exists idx_complaints_parcel_id_created_at on public.complaints(parcel_id, created_at desc);
create index if not exists idx_complaints_tracking_id_created_at on public.complaints(tracking_id, created_at desc);
create index if not exists idx_complaints_status on public.complaints(status);

comment on table public.complaints is 'Customer complaint tickets linked to parcel + user; includes AI classification fields.';

drop trigger if exists trg_complaints_set_updated_at on public.complaints;
create trigger trg_complaints_set_updated_at
before update on public.complaints
for each row
execute function public.set_updated_at();

-- Keep complaints.tracking_id consistent
create or replace function public.sync_complaint_tracking_id()
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

drop trigger if exists trg_complaints_sync_tracking_id on public.complaints;
create trigger trg_complaints_sync_tracking_id
before insert on public.complaints
for each row
execute function public.sync_complaint_tracking_id();

commit;

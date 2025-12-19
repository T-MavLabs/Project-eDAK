-- 08_audit_logs.sql
-- Audit logs: append-only, hash-chained records (permissioned blockchain-style layer).
--
-- Safe to run multiple times.

begin;

DO $$
begin
  if not exists (select 1 from pg_type where typname = 'audit_entity_type') then
    create type public.audit_entity_type as enum (
      'parcel',
      'parcel_event',
      'delivery_prediction',
      'complaint',
      'profile',
      'analytics'
    );
  end if;
end $$;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),

  entity_type public.audit_entity_type not null,
  entity_id uuid,
  action text not null,

  actor_user_id uuid references public.profiles(id) on delete set null,

  -- Immutability
  prev_hash text,
  hash text not null,

  -- Additional structured context (e.g., diff summary)
  data jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  constraint audit_logs_hash_len check (char_length(hash) >= 32)
);

create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id, created_at desc);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_user_id, created_at desc);

comment on table public.audit_logs is 'Append-only audit trail with hash chaining for tamper-evidence.';

-- Compute hash with pgcrypto.digest; chain per (entity_type, entity_id)
create or replace function public.audit_logs_compute_hash()
returns trigger
language plpgsql
as $$
declare
  v_prev text;
  v_payload text;
begin
  -- Find the latest hash for this entity chain
  select al.hash into v_prev
  from public.audit_logs al
  where al.entity_type = new.entity_type
    and (al.entity_id is not distinct from new.entity_id)
  order by al.created_at desc
  limit 1;

  new.prev_hash = v_prev;

  v_payload := coalesce(new.entity_type::text,'') || '|' ||
               coalesce(new.entity_id::text,'') || '|' ||
               coalesce(new.action,'') || '|' ||
               coalesce(new.actor_user_id::text,'') || '|' ||
               coalesce(new.created_at::text,'') || '|' ||
               coalesce(new.prev_hash,'') || '|' ||
               coalesce(new.data::text,'{}');

  new.hash := encode(digest(v_payload, 'sha256'), 'hex');
  return new;
end;
$$;

drop trigger if exists trg_audit_logs_compute_hash on public.audit_logs;
create trigger trg_audit_logs_compute_hash
before insert on public.audit_logs
for each row
execute function public.audit_logs_compute_hash();

-- Enforce append-only behavior (no updates/deletes)
create or replace function public.audit_logs_block_mutations()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs is append-only';
end;
$$;

drop trigger if exists trg_audit_logs_block_update on public.audit_logs;
drop trigger if exists trg_audit_logs_block_delete on public.audit_logs;

create trigger trg_audit_logs_block_update
before update on public.audit_logs
for each row
execute function public.audit_logs_block_mutations();

create trigger trg_audit_logs_block_delete
before delete on public.audit_logs
for each row
execute function public.audit_logs_block_mutations();

commit;

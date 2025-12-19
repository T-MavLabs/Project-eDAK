-- 07_delivery_analytics.sql
-- Snapshot-based hub analytics table (aggregated metrics).
--
-- Safe to run multiple times.

begin;

create table if not exists public.delivery_analytics (
  id uuid primary key default gen_random_uuid(),

  snapshot_date date not null,
  hub_code text not null,
  region_code text,

  total_parcels integer not null default 0,
  delayed_parcels integer not null default 0,
  avg_delay_hours numeric(10,2) not null default 0,

  -- Optional extra aggregates (p95, p99, etc.)
  metrics jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  constraint delivery_analytics_counts_nonneg check (
    total_parcels >= 0 and delayed_parcels >= 0 and delayed_parcels <= total_parcels
  )
);

create unique index if not exists ux_delivery_analytics_snapshot_hub
  on public.delivery_analytics(snapshot_date, hub_code);

create index if not exists idx_delivery_analytics_region_snapshot
  on public.delivery_analytics(region_code, snapshot_date desc);

comment on table public.delivery_analytics is 'Hub-level snapshot metrics used by dashboards and reporting (API-first).';

commit;

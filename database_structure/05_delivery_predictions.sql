-- 05_delivery_predictions.sql
-- Predictive delivery layer: model outputs and risk factors per parcel.
--
-- Safe to run multiple times.

begin;

create table if not exists public.delivery_predictions (
  id uuid primary key default gen_random_uuid(),

  parcel_id uuid not null references public.parcels(id) on delete cascade,
  tracking_id text not null,

  -- Prediction outputs
  predicted_delay_hours integer not null default 0,
  probability_score numeric(5,4) not null default 0.0000, -- 0.0000 - 1.0000
  risk_factors jsonb not null default '{}'::jsonb,

  model_version text,

  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint delivery_predictions_delay_nonneg check (predicted_delay_hours >= 0),
  constraint delivery_predictions_probability_range check (probability_score >= 0 and probability_score <= 1),
  constraint delivery_predictions_tracking_id_len check (char_length(tracking_id) between 6 and 32)
);

create index if not exists idx_delivery_predictions_parcel_id_generated_at
  on public.delivery_predictions(parcel_id, generated_at desc);

create index if not exists idx_delivery_predictions_tracking_id_generated_at
  on public.delivery_predictions(tracking_id, generated_at desc);

comment on table public.delivery_predictions is 'Model outputs for predicted delays and risk factors (JSONB) per parcel.';

-- Keep delivery_predictions.tracking_id consistent
create or replace function public.sync_delivery_prediction_tracking_id()
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

drop trigger if exists trg_delivery_predictions_sync_tracking_id on public.delivery_predictions;
create trigger trg_delivery_predictions_sync_tracking_id
before insert on public.delivery_predictions
for each row
execute function public.sync_delivery_prediction_tracking_id();

commit;

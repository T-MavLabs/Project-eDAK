## Database Structure (Phase 1) — Supabase/PostgreSQL

This folder contains **Phase 1** database work for:

**DAKSH – Delivery Analytics & Knowledge System for Shipment**

DAKSH is an API-first Smart Parcel Tracking & Predictive Delivery Platform built for India Post, enabling proactive logistics, analytics, and MSME integration.

Scope in Phase 1:
- PostgreSQL schema (tables + enums + triggers)
- Supabase-ready **Row Level Security (RLS)** policies
- Clear documentation for judges and future implementation

> Constraint note: These files are **add-only** to the repo and do not modify application code.

---

## How to apply in Supabase

Run these scripts in order inside the **Supabase SQL Editor**:

1. `01_extensions.sql`
2. `02_profiles.sql`
3. `03_parcels.sql`
4. `04_parcel_events.sql`
5. `05_delivery_predictions.sql`
6. `06_complaints.sql`
7. `07_delivery_analytics.sql`
8. `08_audit_logs.sql`
9. `09_rls_policies.sql`

All files are:
- **Idempotent** (safe to run multiple times)
- Written for **Supabase Auth** (`auth.users`) and **RLS-first** security

---

## Design Overview

### Core public contract
This platform is **API-first** and intentionally keeps partner coupling minimal.
The public-facing integration contract is:
- `tracking_id` (string)

Small Indian e-commerce players can store `tracking_id` in their system and link users into the India Post platform UI (`/track?tracking_id=...`) or call platform APIs (later phase).

### Tables (Phase 1)

#### 1) `public.profiles`
- 1:1 with `auth.users`
- Stores RBAC role and operational scope
- Fields include `role`, `hub_code`, `region_code`, and optional `digipin`

Roles:
- `customer`
- `delivery_agent`
- `post_admin`
- `regional_admin`

#### 2) `public.parcels`
- Master parcel record
- **`tracking_id` is unique + public**
- Links to sender/receiver profiles
- Stores operational state:
  - `status`
  - `current_hub_code`
  - `expected_delivery_date`

#### 3) `public.parcel_events`
- Append-only timeline
- Hub-level events with `event_time`, `hub_code`, `region_code`, `status`

#### 4) `public.delivery_predictions`
- Predictive layer storage
- Outputs:
  - `predicted_delay_hours`
  - `probability_score` (0..1)
  - `risk_factors` (JSONB)

#### 5) `public.complaints`
- User complaints tied to `parcel_id` and `user_id`
- Stores AI classification fields for auditability:
  - `ai_category`
  - `ai_confidence`

#### 6) `public.delivery_analytics`
- Snapshot-based hub aggregates (dashboard-ready)
- Example metrics:
  - total vs delayed parcels
  - average delay hours
  - extensible `metrics` JSONB

#### 7) `public.audit_logs`
- Append-only, tamper-evident audit trail
- Hash-chained records (`prev_hash` + computed `hash`)
- Designed as a “permissioned blockchain layer” for government-aligned auditability

---

## Security Model (RLS)

RLS is enabled and policies are explicitly defined in `09_rls_policies.sql`.

### Customers
- Can **read** parcels where they are sender/receiver
- Can **read** their own complaints
- Can **create** complaints only for parcels they own

### Delivery Agents
- Can **read** parcels assigned to their `hub_code`
- Can **read** events/complaints/predictions for parcels in their hub

### Regional Admins
- Can **read** parcels/predictions/complaints within their `region_code`
- Can **read** analytics for their region

### Post Admins
- Full **read/write** on parcels, events, predictions, complaints, analytics
- Allowed to insert audit logs

### Audit logs
- Readable by authenticated users
- Insert restricted to post admins (service role can bypass RLS in Supabase)
- Updates/deletes are blocked via triggers (append-only)

---

## How this supports platform features

- **Predictive delivery**: `delivery_predictions` stores model outputs and structured risk factors for transparent UX and later API exposure.
- **Analytics dashboard**: `delivery_analytics` provides snapshot aggregates that are cheap to query and dashboard-friendly.
- **External e-commerce integration**: `tracking_id` is the only required public-facing coupling; partners can redirect users or integrate via API in later phases.

---

## Notes / Next Phases (not implemented here)
- Realtime subscriptions for events/predictions
- API layer (Edge Functions) for partner integrations
- Stronger hub/region master data tables
- Automated event ingestion pipelines from India Post systems

## Supabase Edge Functions — Core APIs (Phase 2)

This folder contains **Phase 2** backend APIs for **DAKSH**:

**DAKSH – Delivery Analytics & Knowledge System for Shipment**

DAKSH is an API-first Smart Parcel Tracking & Predictive Delivery Platform built for India Post, enabling proactive logistics, analytics, and MSME integration.

Scope (Phase 2):
- Core REST APIs using **Supabase Edge Functions**
- JWT validation + role checks based on `public.profiles`
- DIGIPIN integration via external API
- Audit logging for create + status update actions

> Constraints honored: **add-only** files, no frontend changes, no schema edits.

---

## Environment variables (Supabase)

Set these in your Supabase project (Functions secrets):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The functions validate user JWT via Supabase Auth and then use the service role key for DB reads/writes while enforcing access checks in code.

---

## Shared modules

### `auth-utils/`
- Validates JWT (rejects missing/invalid tokens)
- Loads `profiles.role` + `hub_code` + `region_code`
- Provides role enforcement helpers
- Provides deterministic hashing helpers for audit logs

### `digipin/`
Reusable client for the DIGIPIN API:
- Base URL: `https://my-digipin.onrender.com`
- `POST /digipin/encode` → `{ digipin }`
- `POST /digipin/decode` → `{ latitude, longitude }`

Failures are logged and surfaced as `502` to callers.

---

## Functions

### 1) `parcel-create`
**Purpose**: Create a parcel, generate a public `tracking_id`, store DIGIPINs, create initial event, write audit log.

- **Method**: `POST`
- **Auth**: Required (JWT)
- **Allowed roles**: `customer`, `post_admin`, `regional_admin`

**Body**:
```json
{
  "sender_id": "uuid",
  "receiver_id": "uuid",
  "origin_lat": 28.6139,
  "origin_lng": 77.2090,
  "destination_lat": 19.0760,
  "destination_lng": 72.8777
}
```

**Response**:
```json
{ "tracking_id": "IP-XXXXXX" }
```

Audit log:
- `entity_type = parcel`
- `action = created`

---

### 2) `parcel-track`
**Purpose**: Tracking endpoint returning parcel + timeline + latest prediction (if present).

- **Method**: `GET`
- **Auth**: Required (JWT)
- **Allowed roles**: `customer`, `delivery_agent`, `post_admin`, `regional_admin`

**Query**:
- `?tracking_id=IP-XXXXXX`

**Response**:
```json
{
  "parcel": { "tracking_id": "IP-XXXXXX", "status": "in_transit", "expected_delivery_date": "2025-12-24", "origin_digipin": "...", "destination_digipin": "..." },
  "events": [ { "event_time": "...", "status": "created", "message": "Booked" } ],
  "prediction": null
}
```

Access rules:
- Customers can only track parcels where they are sender/receiver.
- Delivery agents can only track parcels assigned to their hub.
- Regional admins are region-scoped.
- Post admins have full access.

---

### 3) `parcel-events`
**Purpose**: Add a new event, update parcel current status/hub, write audit log.

- **Method**: `POST`
- **Auth**: Required (JWT)
- **Allowed roles**: `delivery_agent`, `post_admin`, `regional_admin`

**Body**:
```json
{
  "tracking_id": "IP-XXXXXX",
  "status": "In Transit",
  "hub": "NDL-HUB-01"
}
```

Status mapping:
- `Booked` → `created`
- `In Transit` → `in_transit`
- `At Hub` → `at_hub`
- `Out for Delivery` → `out_for_delivery`
- `Delivered` → `delivered`

**Response**:
```json
{ "ok": true }
```

Audit log:
- `entity_type = parcel`
- `action = status_update`

---

## External e-commerce integration (platform contract)

The platform stays independent. External e-commerce systems integrate only via:
- **`tracking_id`**

They can:
- Store `tracking_id` on order placement
- Redirect users to platform UI: `/track?tracking_id=...`
- Call platform APIs (these edge functions) in later phases

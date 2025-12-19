## EDAK (Monorepo)

This repository contains **two clearly separated Next.js applications** (monorepo-style layout) to make the hackathon narrative unambiguous:

- **`Backend/`**: **DAKSH – Delivery Analytics & Knowledge System for Shipment** (platform UI)
- **`eCom/`**: **VYAPAR – Virtual Yet Accessible Postal Aggregated Retail** (client UI powered by India Post / DAKSH)

They are **logically + visually independent** and only interact via:

- **`tracking_id`** (string)
- **URL redirect** from VYAPAR (Client) → DAKSH (Platform) tracking page

No shared state, no shared DB, no shared cart/order logic.

## Folder Structure

```text
EDAK/
├── eCom/        → VYAPAR (Client)
└── Backend/     → DAKSH (Platform)
```

Each folder is a standalone Next.js app with its own `package.json`.

## Run Locally (Recommended for judges)

### 1) Start DAKSH (Platform UI)

```bash
cd Backend
npm install
npm run dev
```

- Runs on `http://localhost:3001`
- Core routes: `/track`, `/notifications`, `/complaints`, `/admin`

### 2) Start VYAPAR (Client UI)

Open a second terminal:

```bash
cd eCom
npm install
npm run dev
```

- Runs on `http://localhost:3000`
- Commerce routes: `/market`, `/market/product/[id]`, `/market/cart`, `/market/checkout`, `/market/orders`

## End-to-end flow

- In **VYAPAR (Client)**, place an order in `/market/checkout`.
- VYAPAR generates a `tracking_id` at order placement.
- The user is redirected to **DAKSH (Platform)** tracking with:
  - `/track?tracking_id=<value>`

## Coupling Contract (Intentional)

- **Allowed**
  - `tracking_id` query param
  - absolute URL navigation between apps
- **Disallowed**
  - shared components
  - shared state
  - shared DB
  - shared cart/order logic

## Notes

- See `Backend/README.md` (DAKSH) and `eCom/README.md` (VYAPAR) for system-specific narratives and integration guidance.


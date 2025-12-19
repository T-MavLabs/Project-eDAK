## DAKSH – Delivery Analytics & Knowledge System for Shipment

**DAKSH** is an API-first Smart Parcel Tracking & Predictive Delivery Platform built for India Post, enabling proactive logistics, analytics, and MSME integration.

### Design Philosophy
- **Institutional by default**: DAKSH is designed to feel like national infrastructure—report-like layouts, strong section dividers, and high-contrast typography suitable for officers and policymakers.
- **Color only for meaning**: Accent colors are reserved for alerts, notices, and prediction severity (not for decoration) to preserve trust and reduce “dashboard noise”.
- **Audit-friendly information density**: Tables, stamps, and structured panels prioritize scan events, codes, and operational context over card-heavy marketing layouts.
- **Public trust microcopy**: Language is factual and formal (e.g., “Predicted Delay Window”, “Operational Risk Factors”) to match high-stakes citizen communication.

### UX4G Compliance Notes
- **Why UX4G**: DAKSH is positioned as national logistics infrastructure. UX4G emphasizes clarity, predictability, accessibility, and trust—critical for citizen-facing tracking and operator dashboards.
- **Information-first structure**: Pages are arranged as structured panels and tables with a clear vertical flow (Overview → Details → Actions) to reduce cognitive load.
- **Accessible and auditable**: High-contrast typography, consistent labels, and code-style reference fields (e.g., tracking ID, DIGIPIN) support both accessibility and audit-friendly review.
- **Restrained visual language**: Neutral surfaces, dividers, and minimal icon usage. India Post red is reserved for critical signals and advisories.

### What DAKSH provides
- **Public tracking** via `tracking_id` (customer-facing)
- **Operational visibility**: hub-level events, notifications, complaints, admin analytics UI
- **Integration-ready**: designed to plug into India Post APIs and partner systems

### Platform narrative (judge-friendly)
DAKSH is the **platform**. It is not tied to any single e-commerce store. Multiple Indian MSMEs can integrate by generating/receiving a `tracking_id` and redirecting customers to DAKSH tracking, or by calling APIs (Supabase Edge Functions) in later phases.

### Run locally
```bash
cd Backend
npm install
npm run dev
```

### Key routes (UI)
- `/track`
- `/notifications`
- `/complaints`
- `/admin`


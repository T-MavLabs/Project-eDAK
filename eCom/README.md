## VYAPAR – Virtual Yet Accessible Postal Aggregated Retail

**VYAPAR** is a production-ready Indian e-commerce marketplace platform powered by India Post (DAKSH), enabling MSMEs to sell online with integrated predictive postal logistics.

### Overview

VYAPAR is a full-fledged marketplace supporting:
- **Buyers**: Browse, purchase, track orders, manage returns and reviews
- **Sellers (MSMEs)**: Onboard, list products, manage inventory, fulfill orders, receive payouts
- **Admins**: Verify sellers, approve products, moderate content, handle disputes

### Architecture

```
VYAPAR/
├── database_structure/     # Supabase SQL schema (07-19)
├── supabase/              # Supabase client, auth, storage utilities
├── lib/                   # Business logic (permissions, pricing, logistics)
├── app/
│   ├── auth/             # Authentication (login, signup)
│   ├── seller/           # Seller dashboard, onboarding, products, orders
│   ├── admin/             # Admin dashboard, moderation, analytics
│   └── (commerce)/        # Buyer-facing marketplace
└── components/            # Reusable UI components
```

### Design Philosophy

- **Human-first marketplace**: VYAPAR prioritizes sellers and livelihoods over "infinite grid commerce"
- **Warm, Indian, grassroots**: Trust and community-focused design
- **India Post as trust backbone**: Integrated logistics via DAKSH
- **Production-ready**: Full authentication, payments, inventory, and order management

### Database Setup

Apply SQL files in order (see `database_structure/README.md`):

1. Existing tables (01-03): Products, Orders, Order Items
2. User & Roles (07-08): User profiles, Seller profiles
3. Products (09-11): Extended products, Variants, Inventory
4. Orders & Payments (12-14): Extended orders, Payments, Addresses
5. Reviews & Returns (15-16): Reviews, Returns & Refunds
6. Operations (17-19): Payouts, Notifications, Admin Actions

### Key Features

#### Buyer Features
- User authentication and profiles
- Address book with DIGIPIN support
- Shopping cart with persistence
- Secure checkout with multiple payment methods
- Order tracking via DAKSH
- Product reviews and ratings
- Returns and refunds
- Order history

#### Seller Features
- Seller onboarding with KYC verification
- Product management (create, update, delete)
- Product variants (size, color, etc.)
- Inventory management with low-stock alerts
- Order fulfillment dashboard
- Payout tracking and settlement
- Seller analytics

#### Admin Features
- Seller verification workflow
- Product approval/rejection
- Review moderation
- Dispute handling
- Platform analytics
- Complete audit logs

### DAKSH Integration

VYAPAR integrates with **DAKSH (India Post)** for logistics:

1. **Order Fulfillment**: When seller marks order as "shipped"
   - Generate parcel via DAKSH API
   - Store `tracking_id` in orders table
   - Redirect buyer to DAKSH tracking: `/track?tracking_id=...`

2. **Returns**: When return is approved
   - Generate return shipment via DAKSH API
   - Store `return_tracking_id` in returns table

3. **Tracking**: All tracking happens via DAKSH platform
   - Real-time updates
   - Delay predictions
   - Proactive notifications

### Authentication & Authorization

- **Supabase Auth**: Email/password authentication
- **Role-based Access**: Buyer, Seller, Admin roles
- **Row Level Security (RLS)**: Database-level access control
- **Permission System**: Application-level permission checks

### Payment Processing

- **Payment Methods**: UPI, Card, COD, Netbanking, Wallet
- **Payment Gateway**: Ready for Razorpay/Stripe/PayU integration
- **Refunds**: Automated refund processing
- **Settlements**: Seller payouts with commission deduction

### Run Locally

```bash
cd eCom
npm install

# Set up environment variables
cp env.example .env.local
# Add: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# Apply database schema (in Supabase SQL Editor)
# Run files 01-03, then 07-19 in order

npm run dev
```

Runs on `http://localhost:3000`

### Key Routes

#### Buyer Routes
- `/market` - Marketplace homepage
- `/market/product/[id]` - Product details
- `/market/cart` - Shopping cart
- `/market/checkout` - Checkout
- `/market/orders` - Order history

#### Auth Routes
- `/auth/login` - Sign in
- `/auth/signup` - Create account

#### Seller Routes
- `/seller/onboarding` - Seller registration
- `/seller/dashboard` - Seller dashboard
- `/seller/products` - Product management
- `/seller/orders` - Order fulfillment
- `/seller/payouts` - Payout tracking

#### Admin Routes
- `/admin` - Admin dashboard
- `/admin/sellers` - Seller management
- `/admin/products` - Product moderation
- `/admin/orders` - Order management
- `/admin/audit` - Audit logs

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DAKSH_URL=http://localhost:3001  # DAKSH platform URL
```

### Scalability

- **Database**: Indexed for performance, supports high transaction volumes
- **RLS**: Secure, scalable access control
- **Storage**: Supabase Storage for product images and documents
- **API**: Ready for microservices architecture
- **Logistics**: Integrated with DAKSH for scalable delivery

### Security

- **Row Level Security**: All tables protected by RLS policies
- **Role-based Access**: Buyer/Seller/Admin separation
- **Audit Logging**: Complete admin action audit trail
- **Data Validation**: Database constraints ensure integrity
- **Secure Payments**: Payment gateway integration ready

### Next Steps

1. **Set up Supabase Storage**:
   - Create `product-images` bucket (public)
   - Create `seller-documents` bucket (private)

2. **Configure Payment Gateway**:
   - Integrate Razorpay/Stripe/PayU
   - Set up webhooks
   - Configure refund endpoints

3. **Integrate DAKSH API**:
   - Set up API client
   - Configure tracking webhooks
   - Test parcel creation

4. **Deploy**:
   - Set up production Supabase project
   - Configure environment variables
   - Deploy to Vercel/Netlify

### Documentation

- **Database Schema**: See `database_structure/README.md`
- **API Integration**: See `lib/logistics.ts` for DAKSH integration
- **Permissions**: See `lib/permissions.ts` for access control

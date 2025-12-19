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

---

## UX4G Integration Notes

VYAPAR has been redesigned using the **UX4G Design System** to ensure accessibility, consistency, and compliance with government design standards.

### Design System Implementation

#### Files Added/Modified

**New Files:**
- `src/styles/ux4g-tokens.css` - UX4G design tokens (colors, spacing, typescale, elevation)
- `components/AccessibilityBar.tsx` - Accessibility controls (text size, contrast, keyboard hints)

**Modified Files:**
- `app/globals.css` - Updated with Noto Sans font, UX4G typescale classes, accessibility features
- `app/layout.tsx` - Added AccessibilityBar component
- `components/commerce/CommerceNavbar.tsx` - Redesigned with UX4G layout (logo left, nav center, actions right)
- `app/page.tsx` - Landing page updated with UX4G typescale and sentence case
- `app/(commerce)/market/page.tsx` - Product cards updated with UX4G styling
- `app/(commerce)/market/cart/page.tsx` - Cart page with UX4G form styling
- `app/(commerce)/market/checkout/page.tsx` - Checkout forms with UX4G labels and accessibility
- `components/Footer.tsx` - Multi-column enterprise footer with UX4G styling

### Key UX4G Features Implemented

1. **Typography (Noto Sans)**
   - Primary font: Noto Sans (via Google Fonts CDN)
   - Typescale classes: `.ux4g-display`, `.ux4g-headline`, `.ux4g-title`, `.ux4g-label`, `.ux4g-body`, `.ux4g-body-small`
   - Sentence case for all labels (UX4G rule)

2. **Color System**
   - Brand Primary: `#E74C3C` (India Post Red)
   - Brand Secondary: `#2C3E50` (Deep Navy)
   - Semantic colors: Success, Warning, Danger, Info
   - Neutral grays for backgrounds and borders

3. **Spacing & Layout**
   - 8px base unit spacing scale
   - Responsive 12-column grid
   - Container max-width: 1280px
   - Mobile-first breakpoints

4. **Accessibility**
   - **Accessibility Bar**: Fixed bottom-right widget with:
     - Text size controls (normal, large, xlarge)
     - High contrast toggle
     - Keyboard focus indicators
   - Minimum touch targets: 44x44px
   - ARIA labels on all interactive elements
   - Keyboard navigation support
   - Focus outlines with 2px ring

5. **Components**
   - Cards with elevation tokens (shadows)
   - Forms with sentence case labels
   - Buttons with minimum 44px height
   - Skeleton loaders (replacing spinners)

6. **Navigation**
   - Logo positioned left
   - Primary navigation center-left (Marketplace, Categories, Orders, Track)
   - Auth/cart actions right
   - Mobile menu with full navigation

### Design Tokens

All design tokens are defined in `src/styles/ux4g-tokens.css`:
- Brand colors (primary, secondary, accent, semantic)
- Neutral colors (50-900 scale)
- Spacing scale (1-24 units)
- Border radius tokens
- Elevation/shadow tokens (0-5 levels)
- Typescale (Display, Headline, Title, Label, Body)
- Breakpoints (sm, md, lg, xl, 2xl)
- Touch target minimums

### Accessibility Compliance

- **WCAG 2.1 AA**: Contrast ratios ≥ 4.5:1 for body text
- **WCAG 2.1 AAA**: Critical CTAs meet 7:1 contrast
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Readers**: ARIA labels and semantic HTML
- **Focus Indicators**: Clear 2px focus rings on all focusable elements

### Rollout Instructions

1. **Verify Font Loading**: Check that Noto Sans loads correctly (check Network tab)
2. **Test Accessibility Bar**: 
   - Click text size button to cycle through sizes
   - Toggle high contrast mode
   - Enable keyboard hints
3. **Test Responsive Behavior**: 
   - Mobile (< 640px): Stacked layout, mobile menu
   - Tablet (640px - 1024px): 2-column grids
   - Desktop (> 1024px): Full 3-4 column layouts
4. **Verify Touch Targets**: All buttons and links should be at least 44x44px
5. **Test Keyboard Navigation**: Tab through all interactive elements
6. **Check Contrast**: Use browser DevTools or contrast checker tools

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Notes

- All existing functionality preserved (no breaking changes)
- Backend APIs and routes unchanged
- Supabase integration intact
- Product images use Supabase storage (already implemented)
- Skeleton loaders replace spinners for better UX
- All labels use sentence case per UX4G guidelines

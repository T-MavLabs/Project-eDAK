# VYAPAR Database Structure

This folder contains the complete Supabase/PostgreSQL schema for **VYAPAR – Virtual Yet Accessible Postal Aggregated Retail**, a production-ready Indian e-commerce marketplace.

## Overview

VYAPAR is a full-fledged marketplace platform supporting:
- **Buyers**: Browse, purchase, track orders, manage returns
- **Sellers (MSMEs)**: Onboard, list products, manage inventory, fulfill orders, receive payouts
- **Admins**: Verify sellers, approve products, moderate content, handle disputes

## Database Architecture

### Core Principles
- **Row Level Security (RLS)**: All tables have RLS enabled with explicit policies
- **Backward Compatibility**: Extends existing demo tables without breaking changes
- **Audit Trail**: Complete logging of admin actions and system events
- **Scalability**: Indexed for performance, supports high transaction volumes

## Apply Order

Run these SQL scripts in the Supabase SQL Editor in this exact order:

### Phase 1: Existing Tables (Demo)
1. `01_products.sql` - Product catalog (existing)
2. `02_orders.sql` - Orders (existing)
3. `03_order_items.sql` - Order line items (existing)

### Phase 2: User & Role Management
4. `07_users_roles.sql` - User profiles and roles (buyer/seller/admin)
5. `08_sellers.sql` - Seller (MSME) onboarding and verification

### Phase 3: Product Management
6. `09_products_extended.sql` - Extends products with seller ownership and approval workflow
7. `20_migrate_existing_products.sql` - **IMPORTANT**: Approve existing products (run immediately after 09)
8. `10_product_variants.sql` - Product variants (size, color, etc.)
9. `11_inventory.sql` - Inventory management per variant

### Phase 4: Orders & Payments
10. `12_orders_extended.sql` - Extends orders with buyer/seller references and fulfillment
11. `13_payments.sql` - Payment processing and settlement
12. `14_addresses.sql` - User address book

### Phase 5: Reviews & Returns
13. `15_reviews.sql` - Product reviews and ratings
14. `16_returns_refunds.sql` - Returns and refunds management

### Phase 6: Financial & Operations
15. `17_payouts.sql` - Seller payouts and settlements
16. `18_notifications.sql` - User notifications system
17. `19_admin_actions.sql` - Admin moderation and audit logs

## Table Reference

### User Management
- **`user_profiles`**: User accounts with roles (buyer/seller/admin)
- **`seller_profiles`**: MSME seller profiles with KYC and verification

### Products
- **`products`**: Product catalog with seller ownership and approval workflow
- **`product_variants`**: Product variants (size, color, material, etc.)
- **`inventory`**: Stock levels per product variant

### Orders & Fulfillment
- **`orders`**: Customer orders with buyer/seller references
- **`order_items`**: Order line items (existing, extended)
- **`addresses`**: User shipping addresses with DIGIPIN

### Payments
- **`payments`**: Payment transactions (UPI, Card, COD, etc.)
- **`payouts`**: Seller settlements with commission deduction

### Reviews & Returns
- **`reviews`**: Product reviews and ratings with moderation
- **`returns`**: Return requests with reverse logistics tracking

### Operations
- **`notifications`**: User notifications (order updates, alerts, etc.)
- **`admin_actions`**: Audit log of all admin actions

## Row Level Security (RLS)

All tables have RLS enabled with role-based access:

### Buyers
- Read approved products
- Create and read own orders
- Create and read own payments
- Manage own addresses
- Create reviews for delivered orders
- Request returns for delivered orders
- Read own notifications

### Sellers
- Manage own products (create, update, delete)
- Manage inventory for own products
- Read orders for own products
- Update order status (fulfillment)
- Read reviews for own products
- Handle returns for own orders
- Read own payouts
- Read own notifications

### Admins
- Full read/write access to all tables
- Approve/reject products
- Verify/suspend sellers
- Moderate reviews
- Handle disputes
- Process refunds
- View audit logs

## Integration with DAKSH

VYAPAR integrates with **DAKSH (India Post)** for logistics:

1. **Order Fulfillment**: When seller marks order as "shipped"
   - Generate parcel via DAKSH API
   - Store `tracking_id` in `orders.tracking_id`
   - Redirect buyer to DAKSH tracking page

2. **Returns**: When return is approved
   - Generate return shipment via DAKSH API
   - Store `return_tracking_id` in `returns.return_tracking_id`

3. **Tracking**: All tracking happens via DAKSH platform
   - Buyers redirected to `/track?tracking_id=...`
   - Real-time updates from DAKSH
   - Delay predictions from DAKSH

## Key Features

### Seller Onboarding
- KYC verification workflow
- Business document upload (PAN, GST, License)
- Bank account details for payouts
- Admin approval process

### Product Approval
- Draft → Pending Approval → Approved/Rejected
- Admin moderation with rejection reasons
- Seller can resubmit rejected products

### Inventory Management
- Stock tracking per variant
- Low stock alerts
- Reserved stock for pending orders
- Automatic stock deduction on fulfillment

### Payment Processing
- Multiple payment methods (UPI, Card, COD, Netbanking, Wallet)
- Payment gateway integration
- Refund processing
- Settlement tracking

### Commission & Payouts
- Configurable commission rate per seller
- Automatic commission calculation
- TDS/GST handling
- Scheduled payouts

### Returns & Refunds
- Return request workflow
- Seller approval/rejection
- Reverse logistics via DAKSH
- Automatic refund processing

## Migration Notes

### Backward Compatibility
- Existing `products` table extended (new columns nullable)
- Existing `orders` table extended (new columns nullable)
- Existing `order_items` table unchanged
- Demo data preserved

### Data Migration
- Existing products need `seller_id` assignment (manual or via admin)
- Existing orders need `buyer_id` assignment (based on `user_email`)
- Status migration: `placed` → `confirmed`, `shipped` → `shipped`

## Security Considerations

1. **RLS Policies**: All tables protected by RLS
2. **Service Role**: Use service role for system operations (notifications, triggers)
3. **Audit Logging**: All admin actions logged
4. **Data Validation**: Constraints ensure data integrity
5. **Foreign Keys**: Cascading rules prevent orphaned records

## Performance

- All foreign keys indexed
- Status fields indexed for filtering
- User-specific queries optimized
- JSONB fields indexed with GIN indexes
- Composite indexes for common query patterns

## Next Steps

After applying all SQL files:

1. **Set up Supabase Storage**:
   - Create `product-images` bucket (public)
   - Create `seller-documents` bucket (private)
   - Create `return-evidence` bucket (private)

2. **Configure Auth**:
   - Enable email/password auth
   - Set up email templates
   - Configure OTP (optional)

3. **Set up Payment Gateway**:
   - Integrate Razorpay/Stripe/PayU
   - Configure webhooks
   - Set up refund endpoints

4. **Integrate DAKSH API**:
   - Set up API client
   - Configure tracking webhooks
   - Test parcel creation

5. **Seed Initial Data**:
   - Create admin user
   - Create test sellers
   - Create sample products

## Support

For questions or issues:
- Check individual SQL file comments
- Review RLS policies for access issues
- Verify foreign key constraints for data integrity
- Check indexes for performance issues

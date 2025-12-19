# VYAPAR Navigation & Authentication Guide

## Overview

VYAPAR supports three user roles with distinct navigation paths:
- **Buyers**: Browse marketplace, place orders, track shipments
- **Sellers (MSMEs)**: Manage products, fulfill orders, track payouts
- **Admins**: Platform governance, seller verification, product moderation

## Authentication Methods

### 1. Buyer/Seller Authentication (Supabase Auth)
- **Sign Up**: `/auth/signup` - Choose role (buyer or seller) during registration
- **Login**: `/auth/login` - Email/password authentication
- **Auto-redirect**: Based on user role after login

### 2. Admin Authentication (Hardcoded)
- **Login**: `/auth/admin-login`
- **Credentials**:
  - Username: `admin`
  - Password: `admin123`
- **Storage**: Uses `localStorage` for session management
- **Logout**: Clears localStorage and redirects to admin login

## Navigation Flow

### Landing Page (`/`)
- Role selection cards for Buyers, Sellers, and Admins
- Quick links to marketplace, tracking, login, and signup

### Buyer Flow
1. **Browse**: `/market` - Marketplace with product listings
2. **Cart**: `/market/cart` - Shopping cart
3. **Orders**: `/market/orders` - Order history and tracking
4. **Product Details**: `/market/product/[id]` - Individual product pages
5. **Checkout**: `/market/checkout` - Order placement

### Seller Flow
1. **Sign Up**: `/auth/signup` (select "Sell products")
2. **Onboarding**: `/seller/onboarding` - Business details, KYC, bank info
3. **Dashboard**: `/seller/dashboard` - Stats, products, orders
4. **Products**: `/seller/products` - Product management
5. **Orders**: `/seller/orders` - Order fulfillment

### Admin Flow
1. **Login**: `/auth/admin-login` (hardcoded credentials)
2. **Dashboard**: `/admin` - Platform overview and stats
3. **Seller Management**: `/admin/sellers` - Verify sellers
4. **Product Moderation**: `/admin/products` - Approve/reject products
5. **Orders**: `/admin/orders` - All platform orders
6. **Audit Logs**: `/admin/audit` - Admin action history

## Navbar Features

### CommerceNavbar (Marketplace)
- **Public**: Shows Marketplace, Cart, Orders links + Login/Sign Up buttons
- **Authenticated Buyer**: Shows user dropdown with Orders and Logout
- **Authenticated Seller**: Shows "Seller Dashboard" button + user dropdown
- **Admin (hardcoded)**: Shows "Admin" button if admin session exists

### Role-Based Redirects

#### After Login (`/auth/login`)
- **Buyer** → `/market`
- **Seller** → `/seller/dashboard`
- **Admin** → `/admin` (if Supabase role is admin)

#### After Signup (`/auth/signup`)
- **Buyer** → `/market`
- **Seller** → `/seller/onboarding`

#### Admin Login (`/auth/admin-login`)
- Always → `/admin`

## Protected Routes

### Seller Routes
- `/seller/*` - Requires `seller` role via Supabase Auth
- Redirects to `/auth/login` if not authenticated

### Admin Routes
- `/admin/*` - Requires hardcoded admin authentication
- Checks `localStorage.getItem("admin_authenticated")`
- Redirects to `/auth/admin-login` if not authenticated

### Buyer Routes
- `/market/orders` - Requires authentication
- `/market/checkout` - Requires authentication
- Other marketplace routes are public

## Key Files

- **Admin Login**: `app/auth/admin-login/page.tsx`
- **User Login**: `app/auth/login/page.tsx`
- **Signup**: `app/auth/signup/page.tsx`
- **Landing Page**: `app/page.tsx`
- **Navbar**: `components/commerce/CommerceNavbar.tsx`
- **Admin Auth Utils**: `lib/permissions.ts` (`isAdminAuthenticated`, `requireAdminAuth`)
- **User Auth Utils**: `supabase/auth.ts`

## Testing Credentials

### Admin
- Username: `admin`
- Password: `admin123`

### Buyer/Seller
- Create account via `/auth/signup`
- Choose role during registration
- Use email/password for login

## Notes

1. **Admin authentication is separate** from Supabase Auth - uses localStorage
2. **Role-based navigation** is dynamic based on user's `user_profiles.role`
3. **Seller onboarding** is required before accessing seller dashboard
4. **All routes** respect RLS policies in Supabase
5. **Admin dashboard** shows platform-wide stats and moderation tools

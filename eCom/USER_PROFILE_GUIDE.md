# User Profile & Authentication Guide

## Overview

The VYAPAR platform now has complete user profile management with real-time authentication state updates, email verification tracking, and profile editing capabilities.

## Features Implemented

### 1. Real-Time Auth State Detection
- **Navbar automatically updates** when user logs in/out
- Uses Supabase `onAuthStateChange` listener
- Shows user name/email in account dropdown
- Displays role-specific navigation options

### 2. Email Verification
- **Verification banner** appears at top of marketplace pages
- Shows warning if email is not verified
- Displays verification status in profile page
- Banner can be dismissed but reappears if still unverified

### 3. User Profile Management
- **Profile page**: `/account/profile`
- Edit full name and phone number
- View email (read-only) and verification status
- View account type (buyer/seller/admin)
- Save changes with success/error feedback

### 4. Account Dropdown Menu
- Shows user's name (or email username if no name)
- Displays email address
- Shows email verification status
- Quick access to:
  - Edit Profile
  - My Orders (buyers)
  - Seller Dashboard (sellers)
  - Logout

## User Flow

### After Login
1. User logs in via `/auth/login`
2. Navbar immediately updates to show:
   - User's name/email in account button
   - Account dropdown with profile options
3. If email not verified:
   - Yellow banner appears at top of page
   - Warning shown in account dropdown
4. User redirected based on role:
   - Buyer → `/market`
   - Seller → `/seller/dashboard`
   - Admin → `/admin`

### Profile Editing
1. Click account dropdown → "Edit Profile"
2. Or navigate to `/account/profile`
3. Edit name and phone
4. View email and verification status
5. Save changes
6. Success message confirms update

## Components

### `CommerceNavbar`
- Real-time auth state listener
- User profile display
- Role-based navigation
- Account dropdown with profile link

### `EmailVerificationBanner`
- Checks email verification status
- Displays warning banner
- Dismissible but persistent until verified

### `ProfilePage` (`/account/profile`)
- Full profile editing interface
- Email verification status display
- Form validation and error handling
- Success feedback

## Database Integration

### `user_profiles` Table
- `full_name` - User's full name (editable)
- `phone` - Phone number (editable)
- `email` - From `auth.users` (read-only)
- `role` - buyer/seller/admin (read-only)
- `is_verified` - Email verification status

### Auth State
- Managed by Supabase Auth
- `email_confirmed_at` determines verification
- Session persists across page refreshes

## API Functions

### `getCurrentUser()`
- Returns current authenticated user
- Includes email and verification status

### `getUserProfile(userId?)`
- Fetches user profile from `user_profiles` table
- Returns role, name, phone, etc.

### `updateUserProfile(userId, updates)`
- Updates user profile fields
- Validates and saves changes

## UI/UX Features

### Visual Feedback
- ✅ Success alerts when profile updated
- ⚠️ Warning banners for unverified email
- 🔄 Loading states during operations
- ❌ Error messages for failed operations

### Responsive Design
- Works on mobile and desktop
- Account dropdown adapts to screen size
- Profile page is mobile-friendly

## Security

- Profile editing requires authentication
- Email cannot be changed (managed by Supabase Auth)
- Role cannot be changed (admin-only operation)
- All updates validated before saving

## Next Steps (Optional Enhancements)

1. **Email Resend Verification**
   - Button to resend verification email
   - Link in verification banner

2. **Avatar Upload**
   - Profile picture upload
   - Integration with Supabase Storage

3. **Password Change**
   - Password update functionality
   - Security settings page

4. **Account Deletion**
   - User account deletion option
   - Data retention policies

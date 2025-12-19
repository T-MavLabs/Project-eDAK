# RLS Infinite Recursion Fix

## Problem
The RLS policies for `user_profiles` were causing infinite recursion because they queried the same table within their own policy checks.

## Error
```
infinite recursion detected in policy for relation "user_profiles"
```

## Solution

### Option 1: Run the Fix Script (Recommended)
Run `07_users_roles_FIX.sql` in your Supabase SQL Editor. This will:
1. Create a `security definer` function `is_user_admin()` that bypasses RLS
2. Fix the update policy to remove recursive role check
3. Fix the admin select policy to use the security definer function

### Option 2: Update the Main Script
The main `07_users_roles.sql` file has been updated with the fixes. If you're setting up fresh, just run that file.

## What Changed

### Before (Causing Recursion)
```sql
-- This caused recursion because it queries user_profiles within the policy
create policy user_profiles_update_own
...
with check (
  auth.uid() = id
  and role = (select role from public.user_profiles where id = auth.uid())  -- ❌ Recursion!
);

create policy user_profiles_select_admin
...
using (
  exists (
    select 1 from public.user_profiles  -- ❌ Recursion!
    where id = auth.uid() and role = 'admin'
  )
);
```

### After (Fixed)
```sql
-- Security definer function bypasses RLS
create or replace function public.is_user_admin(check_user_id uuid default auth.uid())
returns boolean
language plpgsql
security definer  -- ✅ Bypasses RLS
stable
as $$
declare
  user_role public.vyapar_user_role;
begin
  select role into user_role
  from public.user_profiles
  where id = check_user_id;
  
  return user_role = 'admin';
end;
$$;

-- Simplified update policy (no recursive check)
create policy user_profiles_update_own
...
with check (
  auth.uid() = id  -- ✅ No recursion
);

-- Admin policy uses security definer function
create policy user_profiles_select_admin
...
using (public.is_user_admin());  -- ✅ No recursion
```

## Role Change Protection

A trigger has been added to prevent role changes at the database level:
- Only admins (checked via `is_user_admin()`) can change roles
- Regular users cannot escalate their own role

## Testing

After applying the fix:
1. Try to load your profile page - should work without errors
2. Try to update your profile - should work
3. Check browser console - no more recursion errors

## Notes

- The `security definer` function runs with the privileges of the function owner (usually postgres), so it can bypass RLS
- Role changes are now prevented via trigger, not RLS policy
- This is a common pattern for avoiding RLS recursion in PostgreSQL

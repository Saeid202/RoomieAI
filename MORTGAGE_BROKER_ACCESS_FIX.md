# Mortgage Broker Dashboard Access - Complete Fix

## Problem Summary
User `chinaplusgroup@gmail.com` signed up as mortgage broker but keeps seeing seeker dashboard. The issue occurs because:

1. Role is stored in TWO places:
   - `auth.users.raw_user_meta_data->>'role'` (used on initial login)
   - `user_profiles.role` (used by RoleInitializer as fallback)

2. The "jump" from mortgage broker to seeker dashboard happens because:
   - Initial login reads from `auth.users` metadata → shows mortgage broker dashboard
   - RoleInitializer then fetches from `user_profiles.role` → finds NULL
   - NULL defaults to 'seeker' → dashboard switches

## Solution Applied

### 1. Database Fix (Run This First)
```bash
# In Supabase SQL Editor, run:
FIX_ROLE_AND_NAME.sql
```

This updates BOTH locations atomically:
- Sets `auth.users.raw_user_meta_data->>'role'` = 'mortgage_broker'
- Sets `user_profiles.role` = 'mortgage_broker'
- Sets `full_name` to satisfy NOT NULL constraint if needed

### 2. Code Fix (Already Applied)
Updated `src/components/dashboard/RoleInitializer.tsx` to:
- Add better logging to track role loading
- Explicitly default to 'seeker' if no role found anywhere
- Prevent NULL from silently overriding valid metadata role

## Steps to Test

1. **Run the SQL fix:**
   ```sql
   -- Copy and paste FIX_ROLE_AND_NAME.sql into Supabase SQL Editor
   -- This handles both role AND full_name constraint
   ```

2. **Verify both are synced:**
   ```sql
   -- The script shows verification automatically
   -- Should show: ✓✓✓ PERFECT - Ready to login ✓✓✓
   ```

3. **Clear browser cache completely:**
   - Close ALL browser tabs
   - Clear browser cache and cookies
   - Or use incognito/private window

4. **Login fresh:**
   - Go to login page
   - Login with: chinaplusgroup@gmail.com
   - Should land directly on mortgage broker dashboard
   - Should NOT jump to seeker dashboard

## Expected Result
✓ User lands on `/dashboard/mortgage-broker`
✓ Sees "Mortgage Broker Dashboard" with client management features
✓ No jumping or switching between dashboards
✓ Role persists across page refreshes

## If Still Not Working

Check browser console for RoleInitializer logs:
```
RoleInitializer - Using role from metadata: mortgage_broker
RoleInitializer - Syncing role to context: mortgage_broker
```

If you see "No role in metadata", the auth.users update didn't work.
If you see "Loaded role from database: null", the user_profiles update didn't work.

## Files Modified
- `FIX_ROLE_AND_NAME.sql` - Complete database fix (handles role + full_name)
- `src/components/dashboard/RoleInitializer.tsx` - Improved role loading logic
- `verify_role_sync.sql` - Quick verification script
- `check_full_name_constraint.sql` - Diagnostic script for constraints

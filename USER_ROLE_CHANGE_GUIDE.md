# User Role Change Guide

## Problem
When you change a user's role in the `user_profiles` table, the change doesn't take effect immediately because the role is cached in TWO places:
1. `user_profiles.role` (database table)
2. `auth.users.raw_user_meta_data` (Supabase auth metadata)

The app reads the role from `user.user_metadata.role` which comes from the auth system, not directly from the `user_profiles` table.

## Solution
You need to update BOTH places when changing a user's role.

## Method 1: Quick Role Change (For Single User)

Run this SQL in Supabase SQL Editor:

```sql
-- Replace 'chinaplusgroup@gmail.com' with the user's email
-- Replace 'mortgage_broker' with the desired role

-- Update user_profiles table
UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE email = 'chinaplusgroup@gmail.com';

-- Update auth.users metadata (CRITICAL!)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE email = 'chinaplusgroup@gmail.com';

-- Verify the changes
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'chinaplusgroup@gmail.com';
```

## Method 2: Reusable Function (Recommended)

### Step 1: Create the function (run once)
Run `create_change_user_role_function.sql` in Supabase SQL Editor to create a reusable function.

### Step 2: Use the function
```sql
-- Change any user's role with a single command
SELECT * FROM change_user_role('user@example.com', 'new_role');

-- Example: Change chinaplusgroup@gmail.com to mortgage_broker
SELECT * FROM change_user_role('chinaplusgroup@gmail.com', 'mortgage_broker');
```

## Valid Roles
- `seeker` - Tenant/renter looking for properties
- `landlord` - Property owner/manager
- `admin` - System administrator
- `developer` - Developer role (if needed)
- `renovator` - Renovation partner
- `mortgage_broker` - Mortgage broker

## After Changing Role

### Option 1: Refresh the page
The user just needs to refresh their browser (F5 or Ctrl+R). The new role will be loaded automatically.

### Option 2: Log out and log back in
If refresh doesn't work, the user can log out and log back in.

## How It Works Now

The app has been updated to:
1. First check `user.user_metadata.role` (from auth system)
2. If no role found in metadata, fetch from `user_profiles` table as fallback
3. This ensures role changes work even if metadata isn't synced

## Files Changed
- `src/components/dashboard/RoleInitializer.tsx` - Now fetches role from database as fallback
- `change_user_role_complete.sql` - Quick script to change a specific user's role
- `create_change_user_role_function.sql` - Reusable function for changing any user's role

## Testing
1. Run the SQL to change the user's role
2. User refreshes the page
3. User should see the new dashboard for their role
4. Check the browser console for "RoleInitializer - Syncing role: [new_role]" message

## Troubleshooting

### Role change doesn't take effect
- Clear browser cache and cookies
- Check both `user_profiles.role` and `auth.users.raw_user_meta_data` are updated
- Try logging out and back in

### User sees wrong dashboard
- Check the console logs for role loading messages
- Verify the role in database matches what you expect
- Check for any JavaScript errors in console

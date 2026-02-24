# Role Cache Fix - Complete Solution

## Problem Identified
When changing a user's role in the `user_profiles` table, the change didn't take effect because:
1. The role is stored in TWO places: `user_profiles.role` AND `auth.users.raw_user_meta_data`
2. The app reads from `user.user_metadata.role` (auth system), not from `user_profiles` table
3. Changing only `user_profiles.role` left the auth metadata out of sync

## Solution Implemented

### 1. Updated RoleInitializer Component
**File**: `src/components/dashboard/RoleInitializer.tsx`

Changes:
- Now fetches role from database as fallback if not in metadata
- Added loading state while fetching role
- Better error handling and logging

This ensures the app can load the role even if metadata is out of sync.

### 2. Created SQL Scripts

#### Quick Role Change Script
**File**: `change_user_role_complete.sql`
- Updates BOTH `user_profiles.role` and `auth.users.raw_user_meta_data`
- Includes verification query
- Ready to use for chinaplusgroup@gmail.com

#### Reusable Function
**File**: `create_change_user_role_function.sql`
- Creates a PostgreSQL function: `change_user_role(email, role)`
- Validates role before changing
- Updates both tables automatically
- Returns success status

Usage:
```sql
SELECT * FROM change_user_role('chinaplusgroup@gmail.com', 'mortgage_broker');
```

#### Verification Script
**File**: `verify_user_role_sync.sql`
- Checks if roles are synced between tables
- Shows sync status with visual indicators
- Can check single user or all users

## How to Change User Role Now

### Option 1: Use the Quick Script
1. Open Supabase SQL Editor
2. Run `change_user_role_complete.sql`
3. User refreshes their browser
4. Done!

### Option 2: Use the Function (Recommended)
1. First time: Run `create_change_user_role_function.sql` to create the function
2. Any time: Run `SELECT * FROM change_user_role('email', 'role');`
3. User refreshes their browser
4. Done!

## For Your Current User

Run this in Supabase SQL Editor:

```sql
-- Change chinaplusgroup@gmail.com to mortgage_broker
UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE email = 'chinaplusgroup@gmail.com';

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE email = 'chinaplusgroup@gmail.com';
```

Then refresh your browser (F5) and you'll see the mortgage broker dashboard!

## Valid Roles
- `seeker` - Tenant/renter
- `landlord` - Property owner
- `admin` - Administrator
- `developer` - Developer
- `renovator` - Renovation partner
- `mortgage_broker` - Mortgage broker

## Testing Steps
1. ✅ Run SQL to change role
2. ✅ Refresh browser (F5)
3. ✅ Check console for "RoleInitializer - Syncing role: mortgage_broker"
4. ✅ Verify correct dashboard loads
5. ✅ Test navigation and features

## Files Created/Modified

### Modified
- `src/components/dashboard/RoleInitializer.tsx` - Enhanced role loading with database fallback

### Created
- `change_user_role_complete.sql` - Quick role change script
- `create_change_user_role_function.sql` - Reusable function
- `verify_user_role_sync.sql` - Verification script
- `USER_ROLE_CHANGE_GUIDE.md` - Detailed guide
- `ROLE_CACHE_FIX_COMPLETE.md` - This summary

## Why This Works

1. **Immediate Effect**: Updating auth metadata means the role is available on next page load
2. **No Logout Required**: User just refreshes the page
3. **Fallback Protection**: If metadata is missing, app fetches from database
4. **Future-Proof**: Function makes role changes easy and consistent

## Next Steps

1. Run `change_user_role_complete.sql` in Supabase SQL Editor
2. Refresh your browser
3. You should see the Mortgage Broker Dashboard
4. Test the profile saving and clients list features

The mortgage broker system is fully ready - you just need to sync the role!

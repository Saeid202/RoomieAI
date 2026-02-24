# Mortgage Broker Signup Issue - Fixed

## Problem
You signed up as a mortgage broker but are seeing the seeker dashboard.

## Root Cause
The role might not have been properly saved during signup, or there's a caching issue in the browser.

## Solution

### Step 1: Fix the Role in Database
Run `fix_mortgage_broker_role.sql` in Supabase SQL Editor:

```sql
-- Update both user_profiles and auth.users
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

### Step 2: Clear Browser Cache
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"

### Step 3: Log Out and Log Back In
1. Log out of the application
2. Close all browser tabs
3. Open a new tab
4. Log back in with `chinaplusgroup@gmail.com`
5. You should now see the Mortgage Broker Dashboard

## Alternative: Force Refresh
If you don't want to log out:
1. Run the SQL script above
2. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) to hard refresh
3. The mortgage broker dashboard should load

## Verification
After logging in, you should see:
- "Mortgage Broker Dashboard" title
- Profile form with: Full Name, Email, Phone, Company Name, License Number
- "My Clients" section below
- Bottom left: My Account, Settings, Log Out buttons

## Why This Happened
The signup process saves the role in two places:
1. `user_profiles.role` table
2. `auth.users.raw_user_meta_data` 

If either wasn't updated correctly during signup, the app defaults to showing the seeker dashboard. The SQL script above ensures both are set to `mortgage_broker`.

## Files
- `fix_mortgage_broker_role.sql` - Run this to fix the role
- `check_new_signup_role.sql` - Check what role was actually saved

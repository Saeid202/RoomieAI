-- Complete User Role Change Script
-- This script updates BOTH the user_profiles table AND the auth metadata
-- so the role change takes effect immediately without needing to log out

-- Step 1: Update the role in user_profiles table
UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE email = 'chinaplusgroup@gmail.com';

-- Step 2: Update the role in auth.users metadata (this is the key!)
-- This ensures the role is synced in the authentication system
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE email = 'chinaplusgroup@gmail.com';

-- Step 3: Verify the changes
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role,
  up.full_name
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'chinaplusgroup@gmail.com';

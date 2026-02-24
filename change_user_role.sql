-- Change User Role in Database
-- This script helps you change a user's role in both auth.users metadata and user_profiles table

-- ============================================
-- OPTION 1: Change role by email
-- ============================================
-- Replace 'user@example.com' with the actual user email
-- Replace 'mortgage_broker' with desired role: 'seeker', 'landlord', 'renovator', 'mortgage_broker', 'admin'

-- Step 1: Update auth.users metadata (raw_user_meta_data)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE email = 'user@example.com';

-- Step 2: Update user_profiles table
UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);


-- ============================================
-- OPTION 2: Change role by user ID
-- ============================================
-- Replace 'USER_ID_HERE' with the actual user UUID

-- Step 1: Update auth.users metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE id = 'USER_ID_HERE';

-- Step 2: Update user_profiles table
UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE id = 'USER_ID_HERE';


-- ============================================
-- VERIFY THE CHANGE
-- ============================================
-- Check user's current role by email
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role,
  u.created_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'user@example.com';

-- Or check by user ID
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role,
  u.created_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.id = 'USER_ID_HERE';


-- ============================================
-- BULK OPERATIONS (Use with caution!)
-- ============================================

-- Change all users with 'lawyer' role to 'mortgage_broker'
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE raw_user_meta_data->>'role' = 'lawyer';

UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE role = 'lawyer';

-- Verify bulk change
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE up.role = 'mortgage_broker';

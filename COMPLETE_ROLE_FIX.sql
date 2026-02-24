-- COMPLETE ROLE FIX FOR chinaplusgroup@gmail.com
-- This fixes BOTH the database AND prevents future issues

BEGIN;

-- Step 1: Update auth.users metadata (source of truth on login)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

-- Step 2: Update user_profiles role (used by RoleInitializer as fallback)
UPDATE user_profiles
SET 
  role = 'mortgage_broker',
  updated_at = NOW()
WHERE id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

COMMIT;

-- Step 3: Verify BOTH are now correct
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  up.role as user_profiles_role,
  up.full_name,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role = 'mortgage_broker' 
    THEN '✓✓✓ BOTH SYNCED - READY TO LOGIN ✓✓✓'
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role IS NULL
    THEN '⚠ Auth correct but profile NULL'
    WHEN u.raw_user_meta_data->>'role' != 'mortgage_broker'
    THEN '✗ Auth role is wrong'
    ELSE '✗ Unknown issue'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'chinaplusgroup@gmail.com';

-- COMPLETE FIX - Updates role AND handles full_name constraint
-- For user: chinaplusgroup@gmail.com

BEGIN;

-- Step 1: Update auth.users metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"mortgage_broker"'::jsonb
  ),
  '{full_name}',
  '"Mortgage Broker"'::jsonb  -- Temporary name to satisfy constraint
)
WHERE id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

-- Step 2: Update user_profiles with role AND full_name
UPDATE user_profiles
SET 
  role = 'mortgage_broker',
  full_name = COALESCE(full_name, 'Mortgage Broker'),  -- Use existing or set default
  updated_at = NOW()
WHERE id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

COMMIT;

-- Step 3: Verify everything is correct
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  u.raw_user_meta_data->>'full_name' as auth_full_name,
  up.role as profile_role,
  up.full_name as profile_full_name,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role = 'mortgage_broker'
     AND up.full_name IS NOT NULL
    THEN '✓✓✓ PERFECT - Ready to login ✓✓✓'
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role IS NULL
    THEN '⚠ Profile role still NULL - UPDATE failed'
    WHEN up.full_name IS NULL
    THEN '⚠ Full name is NULL - constraint issue'
    ELSE '✗ Something else wrong'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'chinaplusgroup@gmail.com';

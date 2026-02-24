-- DEFINITIVE FIX - Update both auth.users and user_profiles
-- This will fix the role in both places

-- Step 1: Update auth.users metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE email = 'chinaplusgroup@gmail.com';

-- Step 2: Update user_profiles role (using ID not email since email column doesn't exist)
UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE id = (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

-- Step 3: Verify BOTH are now correct
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role = 'mortgage_broker' 
    THEN '✓✓✓ SUCCESS - BOTH ARE MORTGAGE_BROKER ✓✓✓'
    ELSE '✗ Still not synced'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'chinaplusgroup@gmail.com';

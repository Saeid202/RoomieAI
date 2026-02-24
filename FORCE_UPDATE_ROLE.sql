-- FORCE UPDATE the role column
-- This will update the role regardless of table structure

-- First, let's see what we're working with
SELECT 
  id,
  email,
  role as current_role
FROM user_profiles
WHERE email = 'chinaplusgroup@gmail.com';

-- Now force update the role
UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE email = 'chinaplusgroup@gmail.com';

-- Verify the update worked
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role = 'mortgage_broker' 
    THEN '✓✓✓ SUCCESS ✓✓✓'
    ELSE '✗ Still not synced'
  END as status
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'chinaplusgroup@gmail.com';

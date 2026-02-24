-- Fix the role for chinaplusgroup@gmail.com to mortgage_broker
-- Run this to correct the role that was saved during signup

-- Update both places
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

-- Verify
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role = 'mortgage_broker' 
    THEN '✓ SUCCESS - Role is mortgage_broker'
    ELSE '✗ ERROR - Role mismatch'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'chinaplusgroup@gmail.com';

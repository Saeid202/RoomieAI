-- Create the missing user_profile record for chinaplusgroup@gmail.com
-- The trigger didn't create it during signup, so we'll create it manually

-- Just update the existing record's role (it already exists but role is wrong)
UPDATE user_profiles
SET 
  role = 'mortgage_broker',
  updated_at = NOW()
WHERE id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

-- Verify both are now correct
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role,
  up.full_name,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role = 'mortgage_broker' 
    THEN '✓✓✓ SUCCESS - Both roles are mortgage_broker ✓✓✓'
    ELSE '✗ ERROR - Role mismatch'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'chinaplusgroup@gmail.com';

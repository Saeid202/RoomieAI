-- Update the user_profiles.role column
-- This is the final piece needed

UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

-- Verify BOTH are now correct
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role = 'mortgage_broker' 
    THEN '✓✓✓ PERFECT - BOTH ARE MORTGAGE_BROKER ✓✓✓'
    ELSE '✗ Still not synced'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

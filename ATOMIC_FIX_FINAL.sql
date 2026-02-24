-- ATOMIC FIX - Update both in a single transaction
BEGIN;

-- Update auth.users metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

-- Update user_profiles role
UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

COMMIT;

-- Immediate verification
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role = 'mortgage_broker' 
    THEN '✓✓✓ SUCCESS ✓✓✓'
    ELSE '✗ Failed'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

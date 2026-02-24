-- ⚡ QUICK FIX - Run this in Supabase SQL Editor NOW ⚡
-- For: chinaplusgroup@gmail.com
-- Issue: Role is NULL in user_profiles, causing dashboard to default to seeker

BEGIN;

-- Fix auth metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"mortgage_broker"'::jsonb
  ),
  '{full_name}',
  '"Mortgage Broker"'::jsonb
)
WHERE id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

-- Fix user_profiles
UPDATE user_profiles
SET 
  role = 'mortgage_broker',
  full_name = COALESCE(full_name, 'Mortgage Broker'),
  updated_at = NOW()
WHERE id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

COMMIT;

-- ✓ Verification
SELECT 
  '✓✓✓ FIXED ✓✓✓' as result,
  email,
  raw_user_meta_data->>'role' as auth_role,
  (SELECT role FROM user_profiles WHERE id = u.id) as profile_role
FROM auth.users u
WHERE email = 'chinaplusgroup@gmail.com';

-- UPSERT FIX - Handles both INSERT and UPDATE cases
-- This will work whether the profile exists or not

DO $$
DECLARE
  target_user_id uuid := '025208b0-39d9-43db-94e0-c7ea91d8aca7';
  target_email text := 'chinaplusgroup@gmail.com';
BEGIN
  -- Step 1: Update auth.users metadata
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
  WHERE id = target_user_id;

  RAISE NOTICE 'Auth metadata updated';

  -- Step 2: UPSERT user_profiles (INSERT if missing, UPDATE if exists)
  INSERT INTO user_profiles (
    id,
    full_name,
    email,
    role,
    account_type,
    current_country,
    created_at,
    updated_at
  )
  VALUES (
    target_user_id,
    'Mortgage Broker',
    target_email,
    'mortgage_broker',
    'individual',
    'Canada',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'mortgage_broker',
    full_name = COALESCE(user_profiles.full_name, 'Mortgage Broker'),
    updated_at = NOW();

  RAISE NOTICE 'Profile upserted';

END $$;

-- Verification
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role,
  up.full_name,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role = 'mortgage_broker'
    THEN '✓✓✓ PERFECT ✓✓✓'
    WHEN up.role IS NULL
    THEN '✗ Profile role is NULL'
    ELSE '⚠ Mismatch'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'chinaplusgroup@gmail.com';

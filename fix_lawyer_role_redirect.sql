-- Fix lawyer role for alirezaeshghi29101985@gmail.com
-- This will check and fix the role in both auth.users metadata and user_profiles

-- Step 1: Check current role status
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as metadata_role,
  up.role as profile_role,
  u.created_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

-- Step 2: Update auth.users metadata to lawyer
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"lawyer"'
)
WHERE email = 'alirezaeshghi29101985@gmail.com';

-- Step 3: Upsert user_profiles with lawyer role
INSERT INTO user_profiles (user_id, email, role, created_at, updated_at)
SELECT 
  id,
  email,
  'lawyer'::user_role,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'alirezaeshghi29101985@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'lawyer'::user_role,
  updated_at = NOW();

-- Step 4: Create lawyer_profile if it doesn't exist
INSERT INTO lawyer_profiles (user_id, email, created_at, updated_at)
SELECT 
  id,
  email,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'alirezaeshghi29101985@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Step 5: Verify the fix
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as metadata_role,
  up.role as profile_role,
  CASE 
    WHEN lp.user_id IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as lawyer_profile_status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN lawyer_profiles lp ON u.id = lp.user_id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

-- JUST INSERT DATA - No table creation, no policies
-- Run this in Supabase SQL Editor

-- Step 1: Update auth metadata to lawyer
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"lawyer"'
)
WHERE email = 'alirezaeshghi29101985@gmail.com';

-- Step 2: Insert or update user_profiles
INSERT INTO public.user_profiles (
  id, 
  role, 
  full_name,
  email,
  created_at, 
  updated_at
)
SELECT 
  u.id,
  'lawyer'::user_role,
  'Lawyer User',
  u.email,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'alirezaeshghi29101985@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'lawyer'::user_role,
  email = EXCLUDED.email,
  full_name = COALESCE(user_profiles.full_name, 'Lawyer User'),
  updated_at = NOW();

-- Step 3: Insert lawyer_profile
INSERT INTO public.lawyer_profiles (
  user_id,
  email,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'alirezaeshghi29101985@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Step 4: Verify
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  up.role as user_profiles_role,
  lp.user_id IS NOT NULL as has_lawyer_profile
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
LEFT JOIN public.lawyer_profiles lp ON u.id = lp.user_id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

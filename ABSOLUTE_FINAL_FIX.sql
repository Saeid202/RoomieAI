-- ABSOLUTE FINAL FIX - Includes ALL required fields
-- Run this in Supabase SQL Editor

-- Step 1: Update auth metadata to lawyer
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"lawyer"'
)
WHERE email = 'alirezaeshghi29101985@gmail.com';

-- Step 2: Insert or update user_profiles with ALL required fields
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
  u.email,  -- Using the actual email from auth.users
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

-- Step 3: Ensure lawyer_profile exists
INSERT INTO public.lawyer_profiles (
  id,
  created_at,
  updated_at
)
SELECT 
  u.id,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'alirezaeshghi29101985@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Step 4: Verify EVERYTHING
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  up.role as user_profiles_role,
  up.email as profile_email,
  up.full_name,
  lp.id IS NOT NULL as has_lawyer_profile
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
LEFT JOIN public.lawyer_profiles lp ON u.id = lp.id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

-- Expected result:
-- auth_metadata_role: lawyer ✓
-- user_profiles_role: lawyer ✓
-- profile_email: alirezaeshghi29101985@gmail.com ✓
-- full_name: Lawyer User ✓
-- has_lawyer_profile: true ✓

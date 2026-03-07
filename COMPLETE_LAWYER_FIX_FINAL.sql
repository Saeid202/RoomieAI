-- COMPLETE FIX - This will fix EVERYTHING
-- Run this entire script in Supabase SQL Editor

-- Step 1: Update auth metadata to lawyer
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"lawyer"'
)
WHERE email = 'alirezaeshghi29101985@gmail.com';

-- Step 2: Insert or update user_profiles with lawyer role
INSERT INTO public.user_profiles (
  id, 
  role, 
  full_name,
  created_at, 
  updated_at
)
SELECT 
  u.id,
  'lawyer'::user_role,
  'Lawyer User',  -- Providing a default full_name
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'alirezaeshghi29101985@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'lawyer'::user_role,
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

-- Step 4: Verify EVERYTHING is correct
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  up.role as user_profiles_role,
  up.full_name,
  lp.id IS NOT NULL as has_lawyer_profile
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
LEFT JOIN public.lawyer_profiles lp ON u.id = lp.id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

-- Expected result:
-- auth_metadata_role: lawyer ✓
-- user_profiles_role: lawyer ✓
-- full_name: Lawyer User ✓
-- has_lawyer_profile: true ✓

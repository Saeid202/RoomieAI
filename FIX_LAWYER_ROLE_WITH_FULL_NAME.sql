-- FINAL FIX - This will work!
-- Run this in Supabase SQL Editor

-- Update existing user_profiles record to set role to lawyer
-- This assumes the record already exists (which it does based on the error)
UPDATE public.user_profiles
SET 
  role = 'lawyer'::user_role,
  updated_at = NOW()
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'alirezaeshghi29101985@gmail.com'
);

-- Verify it worked
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
-- auth_metadata_role: lawyer
-- user_profiles_role: lawyer  ← This should now show "lawyer"
-- has_lawyer_profile: true

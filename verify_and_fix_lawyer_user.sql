-- Comprehensive check and fix for lawyer user
-- Run this in Supabase SQL Editor

-- 1. Check current state
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as metadata_role,
  up.role as profile_role,
  CASE 
    WHEN lp.id IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as lawyer_profile_status
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
LEFT JOIN public.lawyer_profiles lp ON u.id = lp.id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

-- 2. Check if user_profiles table has a 'role' column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
  AND column_name = 'role';

-- 3. If user_profiles exists but doesn't have role column, we need to check the actual structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 4. Fix: Ensure user_profiles record exists with correct role
-- This will insert if missing, or update if exists
INSERT INTO public.user_profiles (id, role, created_at, updated_at)
SELECT 
  u.id,
  'lawyer'::user_role,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'alirezaeshghi29101985@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'lawyer'::user_role,
  updated_at = NOW();

-- 5. Verify the fix
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as metadata_role,
  up.role as profile_role,
  CASE 
    WHEN lp.id IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as lawyer_profile_status
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
LEFT JOIN public.lawyer_profiles lp ON u.id = lp.id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

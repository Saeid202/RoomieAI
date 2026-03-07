-- ✅ COMPLETE LAWYER ROLE VERIFICATION
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- 1. Check user's role in all locations
SELECT 
  '1. USER ROLE CHECK' as check_name,
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  up.role as user_profiles_role,
  lp.user_id IS NOT NULL as has_lawyer_profile,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'lawyer' 
         AND up.role = 'lawyer' 
         AND lp.user_id IS NOT NULL 
    THEN '✅ ALL CORRECT'
    ELSE '❌ NEEDS FIX'
  END as status
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
LEFT JOIN public.lawyer_profiles lp ON u.id = lp.user_id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

-- 2. Check lawyer_profiles table structure
SELECT 
  '2. LAWYER PROFILES TABLE' as check_name,
  COUNT(*) as total_lawyer_profiles,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as profiles_with_email,
  COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as profiles_with_name
FROM public.lawyer_profiles;

-- 3. Check specific lawyer profile details
SELECT 
  '3. YOUR LAWYER PROFILE' as check_name,
  lp.*
FROM public.lawyer_profiles lp
JOIN auth.users u ON lp.user_id = u.id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

-- 4. Check if lawyer role exists in user_role enum
SELECT 
  '4. LAWYER ROLE IN ENUM' as check_name,
  enumlabel as available_roles
FROM pg_enum
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'user_role'
)
ORDER BY enumsortorder;

-- 5. Summary
SELECT 
  '5. SETUP SUMMARY' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM auth.users u
      JOIN public.user_profiles up ON u.id = up.id
      JOIN public.lawyer_profiles lp ON u.id = lp.user_id
      WHERE u.email = 'alirezaeshghi29101985@gmail.com'
        AND u.raw_user_meta_data->>'role' = 'lawyer'
        AND up.role = 'lawyer'
    ) THEN '✅ LAWYER ROLE FULLY CONFIGURED'
    ELSE '❌ CONFIGURATION INCOMPLETE'
  END as final_status;

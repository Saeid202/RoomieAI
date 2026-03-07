-- Comprehensive diagnostic for the seeker access issue
-- Run this in Supabase SQL Editor

-- 1. Check ALL users to see what roles exist
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as metadata_role,
  raw_user_meta_data->>'full_name' as full_name,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check user_profiles table for role assignments
SELECT 
  id,
  email,
  role,
  full_name,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check if there's a mismatch between auth.users and user_profiles
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  p.role as profile_role,
  CASE 
    WHEN (u.raw_user_meta_data->>'role') != p.role THEN '⚠️ MISMATCH'
    ELSE '✓ Match'
  END as status
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.email LIKE '%shabani%'
   OR u.email LIKE '%saeid%'
   OR p.email LIKE '%shabani%'
   OR p.email LIKE '%saeid%';

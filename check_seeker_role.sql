-- Check the current logged-in user's role
-- Run this in Supabase SQL Editor to see what role is assigned

SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as metadata_role,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE email = 'saeid.shabani04@gmail.com';

-- Also check user_profiles table
SELECT 
  id,
  role,
  full_name,
  email
FROM user_profiles
WHERE email = 'saeid.shabani04@gmail.com';

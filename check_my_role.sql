-- Check your current role
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as metadata_role,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Also check user_profiles table
SELECT 
  id,
  email,
  role
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5;

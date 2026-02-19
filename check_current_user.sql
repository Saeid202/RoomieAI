-- Check the current authenticated user
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email LIKE '%@%'
ORDER BY created_at DESC
LIMIT 5;

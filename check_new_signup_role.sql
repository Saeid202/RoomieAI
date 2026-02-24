-- Check the role for the newly signed up user
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  u.raw_user_meta_data as full_metadata,
  up.role as user_profiles_role,
  up.full_name
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'chinaplusgroup@gmail.com'
ORDER BY u.created_at DESC
LIMIT 1;

-- List All Users with Their Roles
-- Useful for seeing all users and their current roles

SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role,
  up.full_name,
  u.created_at,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC;

-- Count users by role
SELECT 
  COALESCE(up.role, 'no_role') as role,
  COUNT(*) as user_count
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
GROUP BY up.role
ORDER BY user_count DESC;

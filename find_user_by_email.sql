-- Find User by Email
-- Use this to get user information before changing their role

-- Replace 'user@example.com' with the actual email
SELECT 
  u.id as user_id,
  u.email,
  u.raw_user_meta_data->>'role' as current_role_in_auth,
  up.role as current_role_in_profiles,
  up.full_name,
  u.created_at,
  u.last_sign_in_at,
  u.email_confirmed_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'user@example.com';

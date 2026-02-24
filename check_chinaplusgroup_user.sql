-- Check if chinaplusgorup@gmail.com exists in the database

SELECT 
  u.id as user_id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  u.raw_user_meta_data->>'full_name' as full_name,
  up.role as profile_role,
  up.full_name as profile_full_name,
  u.created_at,
  u.last_sign_in_at,
  u.email_confirmed_at,
  u.confirmed_at,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as email_verified
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'chinaplusgorup@gmail.com';

-- If no results, user does not exist
-- If results show, user exists with the details above

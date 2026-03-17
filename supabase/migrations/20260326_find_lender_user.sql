-- Find the user by ID since email search isn't working
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  p.role as profile_role
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id
WHERE u.id = 'e5406cb2-6fbd-427e-8c73-c4298be3c08b';

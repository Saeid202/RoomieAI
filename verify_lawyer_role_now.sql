-- Verify the role was updated successfully
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  up.role as user_profiles_role,
  lp.id IS NOT NULL as has_lawyer_profile
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
LEFT JOIN public.lawyer_profiles lp ON u.id = lp.id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

-- You should see:
-- auth_metadata_role: lawyer
-- user_profiles_role: lawyer  ← This should now be "lawyer" not "tenant"
-- has_lawyer_profile: true

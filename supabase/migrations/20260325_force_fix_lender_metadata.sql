-- Force update auth metadata and user_profiles for lender2026@hotmail.com
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "lender"}'::jsonb
WHERE email = 'lender2026@hotmail.com';

-- Also ensure user_profiles has the correct role
UPDATE public.user_profiles
SET role = 'lender'
WHERE email = 'lender2026@hotmail.com';

-- Verify
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  p.role as profile_role
FROM auth.users u
JOIN public.user_profiles p ON p.id = u.id
WHERE u.email = 'lender2026@hotmail.com';

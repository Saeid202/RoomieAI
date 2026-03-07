-- Fix role mismatches - sync auth metadata with user_profiles table
-- This ensures consistent role assignment across the system

-- Fix 1: saeid.shabani64@gmail.com (landlord → seeker)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"seeker"'
)
WHERE email = 'saeid.shabani64@gmail.com';

-- Fix 2: shabani_saeid@hotmail.com (seeker → admin)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'shabani_saeid@hotmail.com';

-- Verify both fixes
SELECT 
  email,
  raw_user_meta_data->>'role' as auth_role,
  (SELECT role FROM user_profiles WHERE id = auth.users.id) as profile_role,
  CASE 
    WHEN raw_user_meta_data->>'role' = (SELECT role FROM user_profiles WHERE id = auth.users.id) 
    THEN '✓ Fixed'
    ELSE '⚠️ Still mismatched'
  END as status
FROM auth.users
WHERE email IN ('saeid.shabani64@gmail.com', 'shabani_saeid@hotmail.com');

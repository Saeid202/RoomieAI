-- Check your current user role
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as current_role
FROM auth.users
WHERE email = 'your-email@example.com';  -- Replace with your email

-- Set your user as admin (replace 'your-email@example.com' with your actual email)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object('role', 'admin')
WHERE email = 'your-email@example.com';

-- Verify the role was set
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'your-email@example.com';


-- Admin User Setup Migration
-- This script sets up the admin role for specific users

-- Example: Add admin role for a specific user
-- Replace 'admin@example.com' with the actual admin email

-- First, you need to get the user ID from auth.users table
-- Run this query to find your user ID:
-- SELECT id, email FROM auth.users WHERE email = 'your-admin-email@example.com';

-- Then insert into user_roles table:
-- Replace 'USER_ID_HERE' with the actual UUID from the query above

-- INSERT INTO public.user_roles (user_id, role, assigned_by)
-- VALUES 
--   ('USER_ID_HERE', 'admin', 'SYSTEM');

-- Example for multiple admins:
-- INSERT INTO public.user_roles (user_id, role, assigned_by)
-- VALUES 
--   ('first-admin-user-id-here', 'admin', 'SYSTEM'),
--   ('second-admin-user-id-here', 'admin', 'SYSTEM');

-- To check existing admin users:
SELECT 
  u.email,
  ur.role,
  ur.assigned_at
FROM auth.users u
INNER JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';

-- To remove admin access from a user:
-- DELETE FROM public.user_roles 
-- WHERE user_id = 'USER_ID_HERE' AND role = 'admin';

-- INSTRUCTIONS:
-- 1. First create an account through the regular signup at /auth
-- 2. Get your user ID by running the SELECT query above
-- 3. Insert your user ID into user_roles table with role = 'admin'
-- 4. You can now login at /admin/login with that account

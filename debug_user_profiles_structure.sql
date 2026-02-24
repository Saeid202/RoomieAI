-- Debug: Check the actual structure and data
-- Find out which table has the role column and what the data looks like

-- Check if user_profiles table has a role column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name = 'role';

-- Check the actual user_profiles record
SELECT *
FROM user_profiles
WHERE id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

-- Check if there's a separate profiles table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check profiles table if it exists
SELECT *
FROM profiles
WHERE id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

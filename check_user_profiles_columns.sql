-- Check what columns exist in user_profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Also check the actual data for this user
SELECT *
FROM user_profiles
WHERE id = (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

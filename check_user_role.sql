SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'saeid.shabani64@gmail.com';

-- Check what data exists for chinaplusgroup@gmail.com
-- This will help us understand the actual table structure

-- Get user ID
SELECT 
  'USER INFO' as section,
  id,
  email,
  created_at,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'chinaplusgroup@gmail.com';

-- Check user_profiles
SELECT 
  'user_profiles' as table_name,
  id,
  role,
  full_name,
  email
FROM user_profiles
WHERE id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

-- Check all profile tables
SELECT 'mortgage_broker_profiles' as table_name, COUNT(*) as count
FROM mortgage_broker_profiles
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com')
UNION ALL
SELECT 'mortgage_profiles', COUNT(*)
FROM mortgage_profiles
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com')
UNION ALL
SELECT 'tenant_profiles', COUNT(*)
FROM tenant_profiles
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com')
UNION ALL
SELECT 'landlord_profiles', COUNT(*)
FROM landlord_profiles
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com')
UNION ALL
SELECT 'renovator_profiles', COUNT(*)
FROM renovator_profiles
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com')
UNION ALL
SELECT 'properties', COUNT(*)
FROM properties
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

-- Check rental_applications table structure
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'rental_applications'
ORDER BY ordinal_position;

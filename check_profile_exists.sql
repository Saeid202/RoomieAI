-- Check if user_profiles record exists for this user
SELECT 
  'Profile exists?' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ YES - Record exists'
    ELSE '✗ NO - Record missing (need to INSERT)'
  END as result,
  COUNT(*) as record_count
FROM user_profiles
WHERE id = '025208b0-39d9-43db-94e0-c7ea91d8aca7'

UNION ALL

SELECT 
  'Auth user exists?' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ YES'
    ELSE '✗ NO'
  END as result,
  COUNT(*) as record_count
FROM auth.users
WHERE id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

-- Show the actual profile data if it exists
SELECT 
  id,
  full_name,
  email,
  role,
  created_at,
  updated_at
FROM user_profiles
WHERE id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

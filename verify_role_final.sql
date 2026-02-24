-- Final verification of the role
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  up.role as user_profiles_role,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role = 'mortgage_broker' 
    THEN '✓✓✓ BOTH CORRECT ✓✓✓'
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role IS NULL
    THEN '⚠ Auth correct, profile role is NULL'
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role != 'mortgage_broker'
    THEN '⚠ Auth correct, profile role is wrong'
    ELSE '✗ Auth role is wrong'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'chinaplusgroup@gmail.com';

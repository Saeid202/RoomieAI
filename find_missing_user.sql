-- Check if the user ID from properties exists in auth.users
SELECT 
  '05979fd9-3da8-45b4-8999-aa784f046bf4' as property_user_id,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = '05979fd9-3da8-45b4-8999-aa784f046bf4'
    ) THEN 'User exists in auth.users'
    ELSE 'User DOES NOT exist in auth.users'
  END as status;

-- Show all users to find the correct one
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'landlord'
ORDER BY created_at DESC;

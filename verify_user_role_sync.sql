-- Verify User Role Synchronization
-- This script checks if a user's role is properly synced between user_profiles and auth.users

-- Check for chinaplusgroup@gmail.com
SELECT 
  u.id as user_id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  up.role as user_profiles_role,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = up.role THEN '✓ SYNCED'
    WHEN u.raw_user_meta_data->>'role' IS NULL THEN '⚠ NO AUTH ROLE'
    WHEN up.role IS NULL THEN '⚠ NO PROFILE ROLE'
    ELSE '✗ NOT SYNCED'
  END as sync_status,
  u.created_at,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'chinaplusgroup@gmail.com';

-- If you want to check all users:
-- SELECT 
--   u.id as user_id,
--   u.email,
--   u.raw_user_meta_data->>'role' as auth_metadata_role,
--   up.role as user_profiles_role,
--   CASE 
--     WHEN u.raw_user_meta_data->>'role' = up.role THEN '✓ SYNCED'
--     WHEN u.raw_user_meta_data->>'role' IS NULL THEN '⚠ NO AUTH ROLE'
--     WHEN up.role IS NULL THEN '⚠ NO PROFILE ROLE'
--     ELSE '✗ NOT SYNCED'
--   END as sync_status
-- FROM auth.users u
-- LEFT JOIN user_profiles up ON u.id = up.id
-- ORDER BY u.created_at DESC;

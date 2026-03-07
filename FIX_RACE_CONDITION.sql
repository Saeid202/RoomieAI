-- FIX RACE CONDITION: Update auth metadata to match database
-- The issue: user.user_metadata.role is still "seeker" but database has "lawyer"
-- This causes RoleInitializer to use the wrong fallback

-- Step 1: Verify current state
SELECT 
  'BEFORE UPDATE' as status,
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  up.role as user_profiles_role
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

-- Step 2: Force update auth metadata to match database
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"lawyer"'
)
WHERE email = 'alirezaeshghi29101985@gmail.com';

-- Step 3: Verify the fix
SELECT 
  'AFTER UPDATE' as status,
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  up.role as user_profiles_role,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = up.role 
    THEN '✅ SYNCED'
    ELSE '❌ MISMATCH'
  END as sync_status
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

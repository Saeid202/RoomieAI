-- ⚡ QUICK FIX: Stop the redirect from lawyer to seeker dashboard
-- Problem: Auth metadata still says "seeker" even though database says "lawyer"
-- Solution: Sync auth metadata with database

-- Update auth metadata to match database
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"lawyer"'
)
WHERE email = 'alirezaeshghi29101985@gmail.com';

-- Verify the fix
SELECT 
  '✅ VERIFICATION' as status,
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  up.role as database_role,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'lawyer' AND up.role = 'lawyer'
    THEN '✅ FIXED - Both are lawyer'
    ELSE '❌ STILL BROKEN'
  END as result
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

-- After running this:
-- 1. Stop dev server (Ctrl+C)
-- 2. Clear browser: localStorage.clear(); sessionStorage.clear(); location.reload();
-- 3. Restart dev server (npm run dev)
-- 4. Login again
-- 5. Should stay on lawyer dashboard!

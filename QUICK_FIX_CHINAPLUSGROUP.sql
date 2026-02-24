-- ============================================
-- QUICK FIX: Change chinaplusgroup@gmail.com to Mortgage Broker
-- ============================================
-- Just copy and paste this entire script into Supabase SQL Editor and run it!

-- Step 1: Update user_profiles table
UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE email = 'chinaplusgroup@gmail.com';

-- Step 2: Update auth.users metadata (THIS IS THE KEY!)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE email = 'chinaplusgroup@gmail.com';

-- Step 3: Verify it worked
SELECT 
  '✓ Role Change Complete!' as status,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
     AND up.role = 'mortgage_broker' 
    THEN '✓ SUCCESS - Both roles updated to mortgage_broker'
    ELSE '✗ ERROR - Roles not synced properly'
  END as verification
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'chinaplusgroup@gmail.com';

-- ============================================
-- NEXT STEP: Refresh your browser (F5)
-- You should see the Mortgage Broker Dashboard!
-- ============================================

-- Change chinaplusgroup@gmail.com from landlord to mortgage_broker

-- Step 1: Update auth.users metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE id = '8b36ab9f-1c63-4ce5-89fa-5af04ae9c161';

-- Step 2: Update user_profiles table
UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE id = '8b36ab9f-1c63-4ce5-89fa-5af04ae9c161';

-- Step 3: Verify the change
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role,
  'Role changed successfully!' as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.id = '8b36ab9f-1c63-4ce5-89fa-5af04ae9c161';

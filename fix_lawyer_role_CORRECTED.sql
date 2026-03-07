-- Fix lawyer role for alirezaeshghi29101985@gmail.com
-- First, let's check what columns exist in user_profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Now let's check the current user status
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as metadata_role,
  u.created_at
FROM auth.users u
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

-- Update auth.users metadata to lawyer
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"lawyer"'
)
WHERE email = 'alirezaeshghi29101985@gmail.com';

-- Create lawyer_profile if it doesn't exist
INSERT INTO lawyer_profiles (user_id, email, created_at, updated_at)
SELECT 
  id,
  email,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'alirezaeshghi29101985@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Verify the fix
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as metadata_role,
  CASE 
    WHEN lp.user_id IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as lawyer_profile_status
FROM auth.users u
LEFT JOIN lawyer_profiles lp ON u.id = lp.user_id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

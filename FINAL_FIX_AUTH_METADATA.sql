-- FINAL FIX - Update auth.users metadata directly
-- The role is currently "seeker" in raw_user_meta_data, needs to be "mortgage_broker"

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{role}',
  '"mortgage_broker"'
)
WHERE email = 'chinaplusgroup@gmail.com';

-- Verify the change
SELECT 
  email,
  raw_user_meta_data->>'role' as role_in_metadata,
  raw_user_meta_data->>'full_name' as full_name_in_metadata,
  CASE 
    WHEN raw_user_meta_data->>'role' = 'mortgage_broker' 
    THEN '✓✓✓ FIXED ✓✓✓'
    ELSE '✗ Still wrong - role is: ' || COALESCE(raw_user_meta_data->>'role', 'NULL')
  END as status
FROM auth.users
WHERE email = 'chinaplusgroup@gmail.com';

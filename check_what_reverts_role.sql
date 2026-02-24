-- Check for triggers that might be reverting the role
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- Also check for triggers on user_profiles
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'user_profiles'
ORDER BY trigger_name;

-- Check current role value
SELECT 
  email,
  raw_user_meta_data->>'role' as current_role,
  created_at,
  updated_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'chinaplusgroup@gmail.com';

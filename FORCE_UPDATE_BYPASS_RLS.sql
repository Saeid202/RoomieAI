-- FORCE UPDATE - Bypasses RLS policies using SECURITY DEFINER function
-- This will work even if RLS is blocking direct UPDATEs

-- Create a temporary function with elevated privileges
CREATE OR REPLACE FUNCTION force_update_mortgage_broker_role()
RETURNS TABLE(
  email text,
  auth_role text,
  profile_role text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"mortgage_broker"'::jsonb
    ),
    '{full_name}',
    '"Mortgage Broker"'::jsonb
  )
  WHERE id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

  -- Update user_profiles with RLS bypassed
  UPDATE user_profiles
  SET 
    role = 'mortgage_broker',
    full_name = COALESCE(full_name, 'Mortgage Broker'),
    updated_at = NOW()
  WHERE id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

  -- Return verification
  RETURN QUERY
  SELECT 
    u.email::text,
    (u.raw_user_meta_data->>'role')::text as auth_role,
    up.role::text as profile_role,
    CASE 
      WHEN u.raw_user_meta_data->>'role' = 'mortgage_broker' 
       AND up.role = 'mortgage_broker'
      THEN '✓✓✓ SUCCESS - Both synced ✓✓✓'
      WHEN up.role IS NULL
      THEN '✗ FAILED - Profile role still NULL (check RLS policies)'
      ELSE '⚠ Partial success'
    END::text as status
  FROM auth.users u
  LEFT JOIN user_profiles up ON u.id = up.id
  WHERE u.email = 'chinaplusgroup@gmail.com';
END;
$$;

-- Execute the function
SELECT * FROM force_update_mortgage_broker_role();

-- Clean up the function
DROP FUNCTION force_update_mortgage_broker_role();

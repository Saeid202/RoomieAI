-- Create a reusable function to change user roles
-- This function updates BOTH user_profiles and auth.users metadata
-- Usage: SELECT change_user_role('user@example.com', 'new_role');

CREATE OR REPLACE FUNCTION change_user_role(
  user_email TEXT,
  new_role TEXT
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  auth_role TEXT,
  profile_role TEXT,
  success BOOLEAN
) AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Validate the role
  IF new_role NOT IN ('seeker', 'landlord', 'admin', 'developer', 'renovator', 'mortgage_broker') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be one of: seeker, landlord, admin, developer, renovator, mortgage_broker', new_role;
  END IF;

  -- Get the user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE auth.users.email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', user_email;
  END IF;

  -- Update user_profiles table
  UPDATE user_profiles
  SET role = new_role
  WHERE id = target_user_id;

  -- Update auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(new_role)
  )
  WHERE id = target_user_id;

  -- Return the updated user info
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email,
    u.raw_user_meta_data->>'role' as auth_role,
    up.role as profile_role,
    TRUE as success
  FROM auth.users u
  LEFT JOIN user_profiles up ON u.id = up.id
  WHERE u.id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (optional - adjust as needed)
-- GRANT EXECUTE ON FUNCTION change_user_role(TEXT, TEXT) TO authenticated;

-- Example usage:
-- SELECT * FROM change_user_role('chinaplusgroup@gmail.com', 'mortgage_broker');

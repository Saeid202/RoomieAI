-- Create a function to get user name from auth.users
-- This function allows reading user metadata from auth.users table
-- which is accessible even if profiles table doesn't have the data

CREATE OR REPLACE FUNCTION public.get_user_name(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name TEXT;
  user_email TEXT;
BEGIN
  -- Get user name from auth.users metadata or email
  SELECT 
    COALESCE(
      raw_user_meta_data->>'full_name',
      raw_user_meta_data->>'name',
      email
    ) INTO user_name
  FROM auth.users
  WHERE id = user_id;
  
  -- If still no name, use email prefix
  IF user_name IS NULL OR user_name = '' THEN
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;
    
    IF user_email IS NOT NULL THEN
      user_name := split_part(user_email, '@', 1);
    ELSE
      user_name := 'User';
    END IF;
  END IF;
  
  RETURN user_name;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_name(UUID) TO authenticated;

-- Create a function to get user email
CREATE OR REPLACE FUNCTION public.get_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  RETURN COALESCE(user_email, '');
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_email(UUID) TO authenticated;


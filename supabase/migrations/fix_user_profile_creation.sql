-- Fix user profile creation trigger and ensure full_name is saved
-- This script ensures that when users sign up, their profile is created with full_name
-- NOTE: This uses user_profiles table (not profiles)

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved trigger function that handles full_name properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with full_name from user metadata
  INSERT INTO public.user_profiles (id, full_name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name',
      NULL
    ),
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(
      EXCLUDED.full_name,
      user_profiles.full_name,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name'
    ),
    email = COALESCE(EXCLUDED.email, user_profiles.email, NEW.email),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also create a function to update existing users' profiles
CREATE OR REPLACE FUNCTION public.sync_user_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update all existing users' profiles with data from auth.users
  INSERT INTO public.user_profiles (id, full_name, email, created_at, updated_at)
  SELECT 
    u.id,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      u.raw_user_meta_data->>'display_name',
      NULL
    ) as full_name,
    u.email,
    u.created_at,
    NOW()
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.id = u.id
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(
      EXCLUDED.full_name,
      user_profiles.full_name,
      (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = user_profiles.id),
      (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = user_profiles.id),
      (SELECT raw_user_meta_data->>'display_name' FROM auth.users WHERE id = user_profiles.id)
    ),
    email = COALESCE(EXCLUDED.email, user_profiles.email, (SELECT email FROM auth.users WHERE id = user_profiles.id)),
    updated_at = NOW();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.sync_user_profiles() TO authenticated;

-- Verify trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Optional: Run sync function to update existing users
-- Uncomment the line below if you want to sync existing users immediately
-- SELECT public.sync_user_profiles();


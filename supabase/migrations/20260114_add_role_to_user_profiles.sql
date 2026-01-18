-- Migration to add role column to user_profiles and update trigger
-- This ensures that when users sign up, their role is captured in the profile

-- Step 1: Add role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
        ALTER TABLE public.user_profiles ADD COLUMN role TEXT DEFAULT 'seeker';
    END IF;
END $$;

-- Step 2: Update handle_new_user function to include role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with full_name and role from user metadata
  INSERT INTO public.user_profiles (id, full_name, role, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name',
      NULL
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'role',
      'seeker' -- Default role if not provided
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
    role = COALESCE(
      EXCLUDED.role,
      user_profiles.role,
      NEW.raw_user_meta_data->>'role'
    ),
    email = COALESCE(EXCLUDED.email, user_profiles.email, NEW.email),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 3: Update sync_user_profiles function to include role
CREATE OR REPLACE FUNCTION public.sync_user_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update all existing users' profiles with data from auth.users
  INSERT INTO public.user_profiles (id, full_name, role, email, created_at, updated_at)
  SELECT 
    u.id,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      u.raw_user_meta_data->>'display_name',
      NULL
    ) as full_name,
    COALESCE(
      u.raw_user_meta_data->>'role',
      'seeker'
    ) as role,
    u.email,
    u.created_at,
    NOW()
  FROM auth.users u
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(
      EXCLUDED.full_name,
      user_profiles.full_name,
      (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = user_profiles.id),
      (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = user_profiles.id),
      (SELECT raw_user_meta_data->>'display_name' FROM auth.users WHERE id = user_profiles.id)
    ),
    role = COALESCE(
      EXCLUDED.role,
      user_profiles.role,
      (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = user_profiles.id)
    ),
    email = COALESCE(EXCLUDED.email, user_profiles.email, (SELECT email FROM auth.users WHERE id = user_profiles.id)),
    updated_at = NOW();
END;
$$;

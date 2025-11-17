-- Safe fix for user_profiles table
-- This script is SAFE and does NOT delete any data
-- It only creates/updates policies, functions, and triggers

-- Step 1: Create user_profiles table if it doesn't exist (SAFE - won't affect existing table)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  occupation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS (SAFE - only enables security, doesn't affect data)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies (SAFE - only adds policies, doesn't delete data)
-- We use IF NOT EXISTS pattern by checking first, then creating only if needed

-- Policy 1: Users can view their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.user_profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

-- Policy 2: Users can update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.user_profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Policy 3: Users can insert their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON public.user_profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Policy 4: Users can view profiles of other users in conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can view profiles in conversations'
  ) THEN
    CREATE POLICY "Users can view profiles in conversations" ON public.user_profiles
      FOR SELECT
      USING (
        auth.uid() = id
        OR
        EXISTS (
          SELECT 1 FROM public.conversations
          WHERE (
            (conversations.landlord_id = user_profiles.id AND conversations.tenant_id = auth.uid())
            OR
            (conversations.tenant_id = user_profiles.id AND conversations.landlord_id = auth.uid())
          )
        )
      );
  END IF;
END $$;

-- Step 4: Create or replace trigger function (SAFE - CREATE OR REPLACE doesn't delete data)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with full_name from user metadata
  -- Use ON CONFLICT to handle cases where profile might already exist
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 5: Create trigger (SAFE - DROP IF EXISTS then CREATE is safe for triggers)
-- Note: Dropping a trigger does NOT delete any data, only removes the trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Verify setup (SAFE - only reads information)
SELECT 'user_profiles table setup complete - NO DATA WAS DELETED' as status;

-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Show current data count (to verify nothing was deleted)
SELECT 
  COUNT(*) as total_profiles,
  COUNT(full_name) as profiles_with_full_name,
  COUNT(*) - COUNT(full_name) as profiles_without_full_name
FROM public.user_profiles;


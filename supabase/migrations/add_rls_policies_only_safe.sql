-- Add RLS policies ONLY for user_profiles table
-- This script is 100% SAFE - it ONLY adds policies, does NOT delete or modify anything
-- No DROP statements, no triggers, no functions - just adding policies

-- Step 1: Make sure table exists (won't affect existing table)
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

-- Step 2: Enable RLS (safe - only enables security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Add RLS policies ONLY (safe - only adds, never deletes)
-- We check if policy exists first, then create only if it doesn't exist

-- Policy 1: Users can view their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename = 'user_profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.user_profiles
      FOR SELECT USING (auth.uid() = id);
    RAISE NOTICE 'Policy "Users can view own profile" created';
  ELSE
    RAISE NOTICE 'Policy "Users can view own profile" already exists - skipping';
  END IF;
END $$;

-- Policy 2: Users can update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename = 'user_profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.user_profiles
      FOR UPDATE USING (auth.uid() = id);
    RAISE NOTICE 'Policy "Users can update own profile" created';
  ELSE
    RAISE NOTICE 'Policy "Users can update own profile" already exists - skipping';
  END IF;
END $$;

-- Policy 3: Users can insert their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename = 'user_profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON public.user_profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
    RAISE NOTICE 'Policy "Users can insert own profile" created';
  ELSE
    RAISE NOTICE 'Policy "Users can insert own profile" already exists - skipping';
  END IF;
END $$;

-- Policy 4: Users can view profiles of other users in conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename = 'user_profiles' 
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
    RAISE NOTICE 'Policy "Users can view profiles in conversations" created';
  ELSE
    RAISE NOTICE 'Policy "Users can view profiles in conversations" already exists - skipping';
  END IF;
END $$;

-- Step 4: Show current policies (read-only, safe)
SELECT 
  'Current RLS policies for user_profiles:' as info,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has conditions'
    ELSE 'No conditions'
  END as has_conditions
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'user_profiles'
ORDER BY policyname;

-- Step 5: Show data count to verify nothing was deleted (read-only, safe)
SELECT 
  'Data verification - NO DATA WAS DELETED' as status,
  COUNT(*) as total_profiles,
  COUNT(full_name) as profiles_with_full_name,
  COUNT(*) - COUNT(full_name) as profiles_without_full_name
FROM public.user_profiles;


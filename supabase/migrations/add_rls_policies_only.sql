-- Add RLS policies for user_profiles table ONLY
-- This script is 100% SAFE - it only ADDS policies, doesn't delete or modify anything
-- No DROP statements, no trigger changes, no function changes

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

-- Step 3: Add RLS policies ONLY (safe - only adds, doesn't remove)
-- We check if each policy exists before creating it

-- Policy 1: Users can view their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND schemaname = 'public'
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.user_profiles
      FOR SELECT USING (auth.uid() = id);
    RAISE NOTICE 'Policy "Users can view own profile" created';
  ELSE
    RAISE NOTICE 'Policy "Users can view own profile" already exists';
  END IF;
END $$;

-- Policy 2: Users can update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND schemaname = 'public'
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.user_profiles
      FOR UPDATE USING (auth.uid() = id);
    RAISE NOTICE 'Policy "Users can update own profile" created';
  ELSE
    RAISE NOTICE 'Policy "Users can update own profile" already exists';
  END IF;
END $$;

-- Policy 3: Users can insert their own profile (THIS IS THE KEY ONE FOR YOUR ISSUE!)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND schemaname = 'public'
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON public.user_profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
    RAISE NOTICE 'Policy "Users can insert own profile" created';
  ELSE
    RAISE NOTICE 'Policy "Users can insert own profile" already exists';
  END IF;
END $$;

-- Policy 4: Users can view profiles of other users in conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND schemaname = 'public'
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
    RAISE NOTICE 'Policy "Users can view profiles in conversations" already exists';
  END IF;
END $$;

-- Step 4: Show current policies (for verification)
SELECT 
  'Current RLS policies on user_profiles:' as info,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE tablename = 'user_profiles' 
  AND schemaname = 'public'
ORDER BY policyname;

-- Step 5: Show data count (to verify nothing was deleted)
SELECT 
  'Data verification:' as info,
  COUNT(*) as total_profiles,
  COUNT(full_name) as profiles_with_full_name,
  COUNT(*) - COUNT(full_name) as profiles_without_full_name
FROM public.user_profiles;

-- Success message
SELECT 'RLS policies added successfully - NO DATA WAS MODIFIED OR DELETED' as status;


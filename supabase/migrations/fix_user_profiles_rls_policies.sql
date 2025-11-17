-- Fix RLS policies for user_profiles table
-- This ensures that triggers and manual inserts can work properly

-- First, check if user_profiles table exists, if not create it
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

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view profiles in conversations" ON public.user_profiles;
DROP POLICY IF EXISTS "Trigger can insert profiles" ON public.user_profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Allow trigger function to insert profiles (SECURITY DEFINER bypasses RLS, but this is a safety measure)
-- Note: SECURITY DEFINER functions bypass RLS, but we add this for clarity
CREATE POLICY "Trigger can insert profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- Policy: Users can view profiles of other users in conversations
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

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;


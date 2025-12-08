-- Fix RLS policy for profiles table to allow viewing profiles in conversations
-- This script ensures users can see landlord and tenant names in chat

-- First, check if the policy already exists and drop it
DROP POLICY IF EXISTS "Users can view profiles in conversations" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a comprehensive policy that allows:
-- 1. Users to view their own profile
-- 2. Users to view profiles of people they have conversations with
CREATE POLICY "Users can view profiles in conversations" ON public.profiles
  FOR SELECT
  USING (
    -- Allow if user is viewing their own profile
    auth.uid() = id
    OR
    -- Allow if the profile belongs to a landlord or tenant in a conversation with the current user
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE (
        (conversations.landlord_id = profiles.id AND conversations.tenant_id = auth.uid())
        OR
        (conversations.tenant_id = profiles.id AND conversations.landlord_id = auth.uid())
      )
    )
  );

-- Also create/update the policy for viewing own profile (in case it was dropped)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;


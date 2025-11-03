-- Fix roommate table RLS policy to support matching functionality
-- This allows authenticated users to view all roommate records for matching while maintaining security for other operations

-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own roommate profile" ON public.roommate;

-- Create new policy: allow authenticated users to view all roommate records (for matching)
CREATE POLICY "Authenticated users can view all roommate profiles for matching" 
ON public.roommate 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Keep existing INSERT, UPDATE, DELETE policies unchanged (users can only modify their own records)
-- These policies already exist and don't need modification:
-- - "Users can insert their own roommate profile"
-- - "Users can update their own roommate profile" 
-- - "Users can delete their own roommate profile"

-- Add comment explaining policy purpose
COMMENT ON POLICY "Authenticated users can view all roommate profiles for matching" ON public.roommate 
IS 'Allows authenticated users to view all roommate profiles for matching algorithm while maintaining security for other operations'; 
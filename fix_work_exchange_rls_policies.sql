-- Fix RLS policies for work_exchange_offers table
-- This will fix the 403 Forbidden error when submitting work exchange offers
-- Run this in your Supabase SQL Editor

-- First, check current policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'work_exchange_offers'
ORDER BY policyname;

-- Drop all existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Anyone can view active work exchange offers" ON public.work_exchange_offers;
DROP POLICY IF EXISTS "Users can view their own work exchange offers" ON public.work_exchange_offers;
DROP POLICY IF EXISTS "Users can create work exchange offers" ON public.work_exchange_offers;
DROP POLICY IF EXISTS "Authenticated users can create work exchange offers" ON public.work_exchange_offers;
DROP POLICY IF EXISTS "Users can update their own work exchange offers" ON public.work_exchange_offers;
DROP POLICY IF EXISTS "Users can delete their own work exchange offers" ON public.work_exchange_offers;
DROP POLICY IF EXISTS "Enable read access for active offers" ON public.work_exchange_offers;
DROP POLICY IF EXISTS "Enable read access for own offers" ON public.work_exchange_offers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.work_exchange_offers;
DROP POLICY IF EXISTS "Enable update for own offers" ON public.work_exchange_offers;
DROP POLICY IF EXISTS "Enable delete for own offers" ON public.work_exchange_offers;

-- Ensure RLS is enabled
ALTER TABLE public.work_exchange_offers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view active offers (public read access)
CREATE POLICY "Public can view active work exchange offers"
ON public.work_exchange_offers
FOR SELECT
USING (status = 'active');

-- Policy 2: Users can view their own offers regardless of status
CREATE POLICY "Users can view their own work exchange offers"
ON public.work_exchange_offers
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 3: Authenticated users can INSERT their own offers
-- This is the critical policy that was failing
CREATE POLICY "Authenticated users can create work exchange offers"
ON public.work_exchange_offers
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- Policy 4: Users can update their own offers
CREATE POLICY "Users can update their own work exchange offers"
ON public.work_exchange_offers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 5: Users can delete their own offers
CREATE POLICY "Users can delete their own work exchange offers"
ON public.work_exchange_offers
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verify the new policies
SELECT 
  policyname, 
  cmd, 
  roles,
  qual, 
  with_check 
FROM pg_policies 
WHERE tablename = 'work_exchange_offers'
ORDER BY policyname;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';


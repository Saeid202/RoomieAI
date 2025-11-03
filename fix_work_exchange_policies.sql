-- Fix RLS policies for work_exchange_offers table
-- Run this in Supabase SQL editor

-- First, let's check current policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'work_exchange_offers';

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Anyone can view active work exchange offers" ON public.work_exchange_offers;
DROP POLICY IF EXISTS "Users can view their own work exchange offers" ON public.work_exchange_offers;
DROP POLICY IF EXISTS "Authenticated users can create work exchange offers" ON public.work_exchange_offers;
DROP POLICY IF EXISTS "Users can update their own work exchange offers" ON public.work_exchange_offers;
DROP POLICY IF EXISTS "Users can delete their own work exchange offers" ON public.work_exchange_offers;

-- Create new, simpler policies
-- Policy 1: Anyone can view active offers
CREATE POLICY "Enable read access for active offers"
ON public.work_exchange_offers
FOR SELECT
USING (status = 'active');

-- Policy 2: Users can view their own offers
CREATE POLICY "Enable read access for own offers"
ON public.work_exchange_offers
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 3: Authenticated users can insert their own offers
CREATE POLICY "Enable insert for authenticated users"
ON public.work_exchange_offers
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' 
  AND auth.uid() = user_id
);

-- Policy 4: Users can update their own offers
CREATE POLICY "Enable update for own offers"
ON public.work_exchange_offers
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 5: Users can delete their own offers
CREATE POLICY "Enable delete for own offers"
ON public.work_exchange_offers
FOR DELETE
USING (auth.uid() = user_id);

-- Verify the new policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'work_exchange_offers';

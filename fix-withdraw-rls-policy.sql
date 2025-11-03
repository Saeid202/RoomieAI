-- Fix RLS policy to allow application withdrawal
-- Run this in Supabase SQL Editor

-- 1. Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can update own pending applications" ON public.rental_applications;

-- 2. Create a new policy that allows users to update their own applications
-- (specifically to change status to 'withdrawn')
CREATE POLICY "Users can update their own applications" ON public.rental_applications
    FOR UPDATE USING (auth.uid() = applicant_id)
    WITH CHECK (auth.uid() = applicant_id);

-- 3. Verify the policy was created
SELECT 'RLS policy updated successfully' as status;
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'rental_applications' 
AND policyname LIKE '%update%';

-- 4. Test if the table exists and has data
SELECT 'Testing table access' as status;
SELECT COUNT(*) as total_applications FROM public.rental_applications;

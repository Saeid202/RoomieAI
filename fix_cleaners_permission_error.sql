-- Fix cleaners permission error - simplified RLS policies
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. DROP ALL EXISTING POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage cleaners" ON public.cleaners;
DROP POLICY IF EXISTS "Landlords can view active cleaners" ON public.cleaners;
DROP POLICY IF EXISTS "Public can view active cleaners" ON public.cleaners;
DROP POLICY IF EXISTS "Authenticated users can manage cleaners" ON public.cleaners;

-- =====================================================
-- 2. CREATE SIMPLIFIED POLICIES
-- =====================================================

-- Policy: Allow all authenticated users to manage cleaners (temporary solution)
CREATE POLICY "Authenticated users can manage cleaners" ON public.cleaners
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Policy: Allow public to view active cleaners
CREATE POLICY "Public can view active cleaners" ON public.cleaners
    FOR SELECT USING (is_active = true);

-- =====================================================
-- 3. VERIFICATION
-- =====================================================

-- Check that policies were created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'cleaners';

-- Test query
SELECT 'Cleaners policies updated successfully' as status;

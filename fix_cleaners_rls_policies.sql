-- Fix RLS policies for cleaners table - corrected version
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. DROP EXISTING POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage cleaners" ON public.cleaners;
DROP POLICY IF EXISTS "Landlords can view active cleaners" ON public.cleaners;
DROP POLICY IF EXISTS "Public can view active cleaners" ON public.cleaners;
DROP POLICY IF EXISTS "Authenticated users can manage cleaners" ON public.cleaners;

-- =====================================================
-- 2. CREATE CORRECTED POLICIES
-- =====================================================

-- Policy: Admins can manage all cleaners
CREATE POLICY "Admins can manage cleaners" ON public.cleaners
    FOR ALL USING (
        auth.role() = 'service_role' OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
        )
    );

-- Policy: Landlords can view active cleaners
CREATE POLICY "Landlords can view active cleaners" ON public.cleaners
    FOR SELECT USING (
        is_active = true AND (
            auth.role() = 'service_role' OR 
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = auth.uid() 
                AND auth.users.raw_user_meta_data ->> 'role' = 'landlord'
            )
        )
    );

-- Policy: Public can view active cleaners (for non-authenticated users)
CREATE POLICY "Public can view active cleaners" ON public.cleaners
    FOR SELECT USING (is_active = true);

-- =====================================================
-- 3. VERIFICATION QUERIES
-- =====================================================

-- Check RLS policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'cleaners';

-- Test query to verify policies work
SELECT 'RLS policies updated successfully' as status;

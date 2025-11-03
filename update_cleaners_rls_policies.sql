-- Update RLS policies for cleaners table to allow landlords to view active cleaners
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. DROP EXISTING POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can manage cleaners" ON public.cleaners;
DROP POLICY IF EXISTS "Public can view active cleaners" ON public.cleaners;

-- =====================================================
-- 2. CREATE NEW POLICIES
-- =====================================================

-- Policy: Admins can manage all cleaners
CREATE POLICY "Admins can manage cleaners" ON public.cleaners
    FOR ALL USING (
        auth.role() = 'service_role' OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.raw_user_meta_data ->> 'role' = 'admin' OR
                auth.users.user_metadata ->> 'role' = 'admin'
            )
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
                AND (
                    auth.users.raw_user_meta_data ->> 'role' = 'landlord' OR
                    auth.users.user_metadata ->> 'role' = 'landlord'
                )
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

-- Test the policies (run these as different users to verify)
-- As admin: Should see all cleaners
-- As landlord: Should see only active cleaners
-- As public: Should see only active cleaners

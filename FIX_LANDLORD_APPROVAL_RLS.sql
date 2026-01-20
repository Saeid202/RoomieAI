-- Database Fix: Enable Landlord Application Approval
-- This script fixes the RLS policies to allow landlords to approve/reject applications for their properties.

-- 1. Enable RLS (just in case)
ALTER TABLE public.rental_applications ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing update policies to avoid conflicts
DROP POLICY IF EXISTS "Users can update their own applications" ON public.rental_applications;
DROP POLICY IF EXISTS "Property owners can update application status" ON public.rental_applications;

-- 3. Policy: Applicants can update their own applications (e.g. to withdraw or edit details)
CREATE POLICY "Users can update their own applications" ON public.rental_applications
    FOR UPDATE TO authenticated 
    USING (auth.uid() = applicant_id)
    WITH CHECK (auth.uid() = applicant_id);

-- 4. Policy: Landlords can update the status of applications for THEIR properties
-- This allows Approve/Reject actions to work in the Landlord Dashboard.
CREATE POLICY "Property owners can update application status" ON public.rental_applications
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE properties.id = rental_applications.property_id 
            AND properties.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE properties.id = rental_applications.property_id 
            AND properties.user_id = auth.uid()
        )
    );

-- 5. Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';

-- 6. Verification
SELECT 'RLS policies updated successfully' as status;
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'rental_applications' 
AND cmd = 'UPDATE';

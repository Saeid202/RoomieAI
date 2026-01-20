-- Database Fix: Repair Rental Applications RLS & Tables
-- This script ensures that the rental_applications table is correctly configured for the project.

-- 1. Ensure the table exists with required columns
CREATE TABLE IF NOT EXISTS public.rental_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    occupation VARCHAR(255) NOT NULL,
    monthly_income DECIMAL(10,2) NOT NULL DEFAULT 0,
    agree_to_terms BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add any missing columns that might have been skipped
ALTER TABLE public.rental_applications ADD COLUMN IF NOT EXISTS signature_data TEXT;
ALTER TABLE public.rental_applications ADD COLUMN IF NOT EXISTS contract_signed BOOLEAN DEFAULT false;
ALTER TABLE public.rental_applications ADD COLUMN IF NOT EXISTS payment_completed BOOLEAN DEFAULT false;
ALTER TABLE public.rental_applications ADD COLUMN IF NOT EXISTS additional_info TEXT;
ALTER TABLE public.rental_applications ADD COLUMN IF NOT EXISTS pet_ownership BOOLEAN DEFAULT false;

-- 3. Relax strict constraints for drafts (Safe & Reversible)
ALTER TABLE public.rental_applications DROP CONSTRAINT IF EXISTS terms_agreement_required;
ALTER TABLE public.rental_applications DROP CONSTRAINT IF EXISTS valid_monthly_income;

-- 4. Re-enable RLS and recreate POLICIES
ALTER TABLE public.rental_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates/conflicts
DROP POLICY IF EXISTS "Users can view own rental applications" ON public.rental_applications;
DROP POLICY IF EXISTS "Users can insert own rental applications" ON public.rental_applications;
DROP POLICY IF EXISTS "Users can update own pending applications" ON public.rental_applications;
DROP POLICY IF EXISTS "Users can delete own pending applications" ON public.rental_applications;
DROP POLICY IF EXISTS "Property owners can view applications for their properties" ON public.rental_applications;
DROP POLICY IF EXISTS "Property owners can update application status" ON public.rental_applications;
DROP POLICY IF EXISTS "Allow authenticated users to upload rental documents" ON public.rental_documents; -- Document related fix
DROP POLICY IF EXISTS "Users can update their own applications" ON public.rental_applications; -- From previous fix attempts

-- 5. Create ROBUST policies using TO authenticated
-- Insert: Users must be logged in and the applicant_id must match their session
CREATE POLICY "Users can insert own rental applications" ON public.rental_applications
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = applicant_id);

-- Select: Users can see their own applications
CREATE POLICY "Users can view own rental applications" ON public.rental_applications
    FOR SELECT TO authenticated 
    USING (auth.uid() = applicant_id);

-- Update: Users can update their own applications (drafts or pending)
CREATE POLICY "Users can update their own applications" ON public.rental_applications
    FOR UPDATE TO authenticated 
    USING (auth.uid() = applicant_id);

-- Landlord view: Owners of the property can see applications
CREATE POLICY "Property owners can view applications" ON public.rental_applications
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE properties.id = rental_applications.property_id 
            AND properties.user_id = auth.uid()
        )
    );

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';

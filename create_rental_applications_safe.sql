-- Safe script to create rental_applications table and policies
-- This script checks if objects exist before creating them

-- 1. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rental_applications (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References with CASCADE delete
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Application Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'under_review', 'approved', 'rejected', 'withdrawn'
    )),
    
    -- Personal Information
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    occupation VARCHAR(255) NOT NULL,
    employer VARCHAR(255),
    monthly_income DECIMAL(10,2) NOT NULL,
    
    -- Rental Preferences
    move_in_date DATE,
    lease_duration VARCHAR(20) CHECK (lease_duration IN (
        '6-months', '12-months', '18-months', '24-months', 'month-to-month'
    )),
    pet_ownership BOOLEAN DEFAULT false,
    smoking_status VARCHAR(20) CHECK (smoking_status IN (
        'non-smoker', 'occasional', 'regular'
    )),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(100),
    
    -- Document URLs (stored as JSON arrays)
    reference_documents JSONB DEFAULT '[]'::jsonb,
    employment_documents JSONB DEFAULT '[]'::jsonb,
    credit_documents JSONB DEFAULT '[]'::jsonb,
    additional_documents JSONB DEFAULT '[]'::jsonb,
    
    -- Additional Information
    additional_info TEXT,
    
    -- Terms and Conditions
    agree_to_terms BOOLEAN NOT NULL DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_monthly_income CHECK (monthly_income > 0),
    CONSTRAINT terms_agreement_required CHECK (agree_to_terms = true)
);

-- 2. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_rental_applications_property_id ON public.rental_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_rental_applications_applicant_id ON public.rental_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_rental_applications_status ON public.rental_applications(status);
CREATE INDEX IF NOT EXISTS idx_rental_applications_created_at ON public.rental_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_rental_applications_property_status ON public.rental_applications(property_id, status);

-- 3. Enable Row Level Security
ALTER TABLE public.rental_applications ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own rental applications" ON public.rental_applications;
DROP POLICY IF EXISTS "Users can insert own rental applications" ON public.rental_applications;
DROP POLICY IF EXISTS "Users can update own pending applications" ON public.rental_applications;
DROP POLICY IF EXISTS "Users can delete own pending applications" ON public.rental_applications;
DROP POLICY IF EXISTS "Property owners can view applications for their properties" ON public.rental_applications;
DROP POLICY IF EXISTS "Property owners can update application status" ON public.rental_applications;

-- 5. Create RLS policies
CREATE POLICY "Users can view own rental applications" ON public.rental_applications
    FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Users can insert own rental applications" ON public.rental_applications
    FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Users can update own pending applications" ON public.rental_applications
    FOR UPDATE USING (
        auth.uid() = applicant_id AND status = 'pending'
    );

CREATE POLICY "Users can delete own pending applications" ON public.rental_applications
    FOR DELETE USING (
        auth.uid() = applicant_id AND status = 'pending'
    );

CREATE POLICY "Property owners can view applications for their properties" ON public.rental_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE properties.id = rental_applications.property_id 
            AND properties.user_id = auth.uid()
        )
    );

CREATE POLICY "Property owners can update application status" ON public.rental_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE properties.id = rental_applications.property_id 
            AND properties.user_id = auth.uid()
        )
    );

-- 6. Create or replace the function
CREATE OR REPLACE FUNCTION update_rental_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_rental_applications_updated_at ON public.rental_applications;

-- 8. Create the trigger
CREATE TRIGGER trigger_update_rental_applications_updated_at
    BEFORE UPDATE ON public.rental_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_rental_applications_updated_at();

-- 9. Verify the table was created successfully
SELECT 
    'rental_applications table created successfully' as status,
    COUNT(*) as existing_policies
FROM pg_policies 
WHERE tablename = 'rental_applications' 
AND schemaname = 'public';

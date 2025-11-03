-- =====================================================
-- Rental Applications Table Creation Script
-- =====================================================
-- This script creates a table to store rental applications
-- =====================================================

-- Drop table if it exists (for development/testing)
DROP TABLE IF EXISTS rental_applications;

-- Create the rental_applications table
CREATE TABLE rental_applications (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
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

-- =====================================================
-- Indexes for better query performance
-- =====================================================

-- Index on property_id for finding applications for a specific property
CREATE INDEX idx_rental_applications_property_id ON rental_applications(property_id);

-- Index on applicant_id for finding applications by a specific user
CREATE INDEX idx_rental_applications_applicant_id ON rental_applications(applicant_id);

-- Index on status for filtering applications by status
CREATE INDEX idx_rental_applications_status ON rental_applications(status);

-- Index on created_at for sorting by application date
CREATE INDEX idx_rental_applications_created_at ON rental_applications(created_at);

-- Composite index for landlord dashboard queries
CREATE INDEX idx_rental_applications_property_status ON rental_applications(property_id, status);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on the table
ALTER TABLE rental_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own applications
CREATE POLICY "Users can view own rental applications" ON rental_applications
    FOR SELECT USING (auth.uid() = applicant_id);

-- Policy: Users can insert their own applications
CREATE POLICY "Users can insert own rental applications" ON rental_applications
    FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- Policy: Users can update their own applications (only if pending)
CREATE POLICY "Users can update own pending applications" ON rental_applications
    FOR UPDATE USING (
        auth.uid() = applicant_id AND status = 'pending'
    );

-- Policy: Users can delete their own applications (only if pending)
CREATE POLICY "Users can delete own pending applications" ON rental_applications
    FOR DELETE USING (
        auth.uid() = applicant_id AND status = 'pending'
    );

-- Policy: Property owners can view applications for their properties
CREATE POLICY "Property owners can view applications for their properties" ON rental_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = rental_applications.property_id 
            AND properties.user_id = auth.uid()
        )
    );

-- Policy: Property owners can update application status for their properties
CREATE POLICY "Property owners can update application status" ON rental_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = rental_applications.property_id 
            AND properties.user_id = auth.uid()
        )
    );

-- =====================================================
-- Triggers for automatic timestamp updates
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_rental_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row updates
CREATE TRIGGER trigger_update_rental_applications_updated_at
    BEFORE UPDATE ON rental_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_rental_applications_updated_at();

-- =====================================================
-- Views for common queries
-- =====================================================

-- View for landlord dashboard - applications with property details
CREATE VIEW landlord_applications_view AS
SELECT 
    ra.id as application_id,
    ra.status,
    ra.full_name as applicant_name,
    ra.email as applicant_email,
    ra.phone as applicant_phone,
    ra.occupation,
    ra.monthly_income,
    ra.move_in_date,
    ra.lease_duration,
    ra.pet_ownership,
    ra.smoking_status,
    ra.additional_info,
    ra.created_at as application_date,
    p.id as property_id,
    p.listing_title,
    p.address,
    p.city,
    p.state,
    p.monthly_rent
FROM rental_applications ra
JOIN properties p ON ra.property_id = p.id
WHERE p.user_id = auth.uid()
ORDER BY ra.created_at DESC;

-- View for applicant dashboard - user's applications with property details
CREATE VIEW applicant_applications_view AS
SELECT 
    ra.id as application_id,
    ra.status,
    ra.created_at as application_date,
    ra.updated_at as last_updated,
    p.id as property_id,
    p.listing_title,
    p.address,
    p.city,
    p.state,
    p.monthly_rent,
    p.property_type
FROM rental_applications ra
JOIN properties p ON ra.property_id = p.id
WHERE ra.applicant_id = auth.uid()
ORDER BY ra.created_at DESC;

-- =====================================================
-- Sample data (optional - for testing)
-- =====================================================

-- Uncomment the following lines to insert sample data for testing
/*
INSERT INTO rental_applications (
    property_id,
    applicant_id,
    full_name,
    email,
    phone,
    occupation,
    monthly_income,
    agree_to_terms
) VALUES (
    (SELECT id FROM properties LIMIT 1),
    auth.uid(),
    'John Doe',
    'john@example.com',
    '+1234567890',
    'Software Engineer',
    5000.00,
    true
);
*/

-- =====================================================
-- Rental applications setup completed successfully!
-- =====================================================

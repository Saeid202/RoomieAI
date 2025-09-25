-- =====================================================
-- Lease Contracts Table Creation Script
-- =====================================================
-- This script creates tables for digital lease contracts
-- and signature tracking
-- =====================================================

-- Drop table if it exists (for development/testing)
DROP TABLE IF EXISTS lease_contracts;

-- Create the lease_contracts table
CREATE TABLE lease_contracts (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key references
    application_id UUID NOT NULL REFERENCES rental_applications(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Contract Terms
    lease_start_date DATE NOT NULL,
    lease_end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2) NOT NULL,
    lease_duration_months INTEGER NOT NULL,
    
    -- Property and Tenant Information (cached for contract)
    property_address TEXT NOT NULL,
    property_city VARCHAR(100) NOT NULL,
    property_state VARCHAR(50) NOT NULL,
    property_zip VARCHAR(20) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    property_bedrooms INTEGER,
    property_bathrooms DECIMAL(3,1),
    property_square_footage INTEGER,
    
    -- Landlord Information (cached for contract)
    landlord_name VARCHAR(255) NOT NULL,
    landlord_email VARCHAR(255) NOT NULL,
    landlord_phone VARCHAR(20),
    
    -- Tenant Information (cached for contract)
    tenant_name VARCHAR(255) NOT NULL,
    tenant_email VARCHAR(255) NOT NULL,
    tenant_phone VARCHAR(20),
    
    -- Lease Specific Terms
    pet_policy TEXT,
    smoking_policy TEXT,
    utilities_included JSONB DEFAULT '[]'::jsonb,
    parking_details TEXT,
    maintenance_responsibility TEXT,
    additional_terms TEXT,
    
    -- Contract Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 
        'pending_landlord_signature', 
        'pending_tenant_signature', 
        'fully_signed', 
        'executed',
        'cancelled'
    )),
    
    -- Digital Signatures
    landlord_signature JSONB, -- {signature_data: base64, signed_at: timestamp, ip_address: string, user_agent: string}
    tenant_signature JSONB,
    
    -- Contract Generation Details
    contract_template_version VARCHAR(10) DEFAULT 'v1.0',
    generated_by UUID REFERENCES auth.users(id),
    
    -- Legal and Compliance
    electronic_signature_consent BOOLEAN DEFAULT true,
    terms_acceptance_landlord BOOLEAN DEFAULT false,
    terms_acceptance_tenant BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Contract offer expiration
    
    -- Constraints
    CONSTRAINT valid_lease_dates CHECK (lease_end_date > lease_start_date),
    CONSTRAINT valid_rent_amount CHECK (monthly_rent > 0),
    CONSTRAINT valid_deposit CHECK (security_deposit >= 0),
    CONSTRAINT valid_duration CHECK (lease_duration_months > 0),
    CONSTRAINT unique_application_contract UNIQUE (application_id)
);

-- =====================================================
-- Indexes for better query performance
-- =====================================================

-- Index on application_id for finding contract by application
CREATE INDEX idx_lease_contracts_application_id ON lease_contracts(application_id);

-- Index on property_id for finding contracts by property
CREATE INDEX idx_lease_contracts_property_id ON lease_contracts(property_id);

-- Index on landlord_id for landlord dashboard queries
CREATE INDEX idx_lease_contracts_landlord_id ON lease_contracts(landlord_id);

-- Index on tenant_id for tenant dashboard queries
CREATE INDEX idx_lease_contracts_tenant_id ON lease_contracts(tenant_id);

-- Index on status for filtering contracts by status
CREATE INDEX idx_lease_contracts_status ON lease_contracts(status);

-- Index on created_at for sorting by creation date
CREATE INDEX idx_lease_contracts_created_at ON lease_contracts(created_at);

-- Composite index for landlord dashboard queries
CREATE INDEX idx_lease_contracts_landlord_status ON lease_contracts(landlord_id, status);

-- Composite index for tenant dashboard queries
CREATE INDEX idx_lease_contracts_tenant_status ON lease_contracts(tenant_id, status);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on the table
ALTER TABLE lease_contracts ENABLE ROW LEVEL SECURITY;

-- Policy: Landlords can view contracts for their properties
CREATE POLICY "Landlords can view their property contracts" ON lease_contracts
    FOR SELECT USING (auth.uid() = landlord_id);

-- Policy: Tenants can view their own contracts
CREATE POLICY "Tenants can view their own contracts" ON lease_contracts
    FOR SELECT USING (auth.uid() = tenant_id);

-- Policy: Landlords can create contracts for their properties
CREATE POLICY "Landlords can create contracts for their properties" ON lease_contracts
    FOR INSERT WITH CHECK (auth.uid() = landlord_id);

-- Policy: Landlords can update their contracts (before tenant signs)
CREATE POLICY "Landlords can update their contracts" ON lease_contracts
    FOR UPDATE USING (
        auth.uid() = landlord_id 
        AND status IN ('draft', 'pending_landlord_signature')
    );

-- Policy: Tenants can update contracts to add their signature
CREATE POLICY "Tenants can sign their contracts" ON lease_contracts
    FOR UPDATE USING (
        auth.uid() = tenant_id 
        AND status = 'pending_tenant_signature'
    );

-- Policy: Both parties can update fully signed contracts (for execution)
CREATE POLICY "Both parties can execute signed contracts" ON lease_contracts
    FOR UPDATE USING (
        (auth.uid() = landlord_id OR auth.uid() = tenant_id)
        AND status = 'fully_signed'
    );

-- =====================================================
-- Triggers for automatic timestamp updates
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_lease_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Auto-update status based on signatures
    IF OLD.landlord_signature IS NULL AND NEW.landlord_signature IS NOT NULL THEN
        IF NEW.tenant_signature IS NOT NULL THEN
            NEW.status = 'fully_signed';
        ELSE
            NEW.status = 'pending_tenant_signature';
        END IF;
    END IF;
    
    IF OLD.tenant_signature IS NULL AND NEW.tenant_signature IS NOT NULL THEN
        IF NEW.landlord_signature IS NOT NULL THEN
            NEW.status = 'fully_signed';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at and status on row updates
CREATE TRIGGER trigger_update_lease_contracts_updated_at
    BEFORE UPDATE ON lease_contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_lease_contracts_updated_at();

-- =====================================================
-- Views for common queries
-- =====================================================

-- View for landlord dashboard - contracts with application details
CREATE VIEW landlord_contracts_view AS
SELECT 
    lc.id as contract_id,
    lc.status,
    lc.lease_start_date,
    lc.lease_end_date,
    lc.monthly_rent,
    lc.security_deposit,
    lc.tenant_name,
    lc.tenant_email,
    lc.property_address,
    lc.property_city,
    lc.property_state,
    lc.created_at as contract_created,
    lc.landlord_signature IS NOT NULL as landlord_signed,
    lc.tenant_signature IS NOT NULL as tenant_signed,
    ra.id as application_id,
    ra.created_at as application_date
FROM lease_contracts lc
JOIN rental_applications ra ON lc.application_id = ra.id
WHERE lc.landlord_id = auth.uid()
ORDER BY lc.created_at DESC;

-- View for tenant dashboard - user's contracts
CREATE VIEW tenant_contracts_view AS
SELECT 
    lc.id as contract_id,
    lc.status,
    lc.lease_start_date,
    lc.lease_end_date,
    lc.monthly_rent,
    lc.security_deposit,
    lc.landlord_name,
    lc.landlord_email,
    lc.property_address,
    lc.property_city,
    lc.property_state,
    lc.property_type,
    lc.created_at as contract_created,
    lc.landlord_signature IS NOT NULL as landlord_signed,
    lc.tenant_signature IS NOT NULL as tenant_signed,
    ra.id as application_id
FROM lease_contracts lc
JOIN rental_applications ra ON lc.application_id = ra.id
WHERE lc.tenant_id = auth.uid()
ORDER BY lc.created_at DESC;

-- =====================================================
-- Functions for contract management
-- =====================================================

-- Function to generate contract from approved application
CREATE OR REPLACE FUNCTION generate_lease_contract(
    p_application_id UUID,
    p_lease_start_date DATE,
    p_lease_duration_months INTEGER,
    p_additional_terms TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_contract_id UUID;
    v_application rental_applications%ROWTYPE;
    v_property properties%ROWTYPE;
    v_landlord auth.users%ROWTYPE;
    v_tenant auth.users%ROWTYPE;
BEGIN
    -- Get application details
    SELECT * INTO v_application FROM rental_applications WHERE id = p_application_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found';
    END IF;
    
    -- Get property details
    SELECT * INTO v_property FROM properties WHERE id = v_application.property_id;
    
    -- Get landlord details
    SELECT * INTO v_landlord FROM auth.users WHERE id = v_property.user_id;
    
    -- Get tenant details
    SELECT * INTO v_tenant FROM auth.users WHERE id = v_application.applicant_id;
    
    -- Calculate lease end date
    DECLARE
        v_lease_end_date DATE := p_lease_start_date + (p_lease_duration_months || ' months')::INTERVAL;
    BEGIN
        -- Insert new contract
        INSERT INTO lease_contracts (
            application_id,
            property_id,
            landlord_id,
            tenant_id,
            lease_start_date,
            lease_end_date,
            monthly_rent,
            security_deposit,
            lease_duration_months,
            property_address,
            property_city,
            property_state,
            property_zip,
            property_type,
            property_bedrooms,
            property_bathrooms,
            property_square_footage,
            landlord_name,
            landlord_email,
            landlord_phone,
            tenant_name,
            tenant_email,
            tenant_phone,
            pet_policy,
            smoking_policy,
            utilities_included,
            additional_terms,
            generated_by,
            status
        ) VALUES (
            p_application_id,
            v_application.property_id,
            v_property.user_id,
            v_application.applicant_id,
            p_lease_start_date,
            v_lease_end_date,
            v_property.monthly_rent,
            COALESCE(v_property.security_deposit, v_property.monthly_rent), -- Default to 1 month rent
            p_lease_duration_months,
            v_property.address,
            v_property.city,
            v_property.state,
            v_property.zip_code,
            v_property.property_type,
            v_property.bedrooms,
            v_property.bathrooms,
            v_property.square_footage,
            COALESCE(v_landlord.user_metadata->>'full_name', v_landlord.email),
            v_landlord.email,
            v_landlord.user_metadata->>'phone',
            v_application.full_name,
            v_application.email,
            v_application.phone,
            v_property.pet_policy,
            CASE 
                WHEN v_application.smoking_status = 'non-smoker' THEN 'Smoking is prohibited on the premises'
                ELSE 'Smoking policy to be determined'
            END,
            COALESCE(v_property.utilities_included, '[]'::jsonb),
            p_additional_terms,
            auth.uid(),
            'pending_landlord_signature'
        ) RETURNING id INTO v_contract_id;
        
        RETURN v_contract_id;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Sample data functions (for testing)
-- =====================================================

-- Function to create a test contract (for development only)
CREATE OR REPLACE FUNCTION create_test_lease_contract()
RETURNS UUID AS $$
DECLARE
    v_contract_id UUID;
BEGIN
    -- This function should only be used in development
    INSERT INTO lease_contracts (
        application_id,
        property_id,
        landlord_id,
        tenant_id,
        lease_start_date,
        lease_end_date,
        monthly_rent,
        security_deposit,
        lease_duration_months,
        property_address,
        property_city,
        property_state,
        property_zip,
        property_type,
        landlord_name,
        landlord_email,
        tenant_name,
        tenant_email,
        status
    ) VALUES (
        gen_random_uuid(), -- placeholder application_id
        gen_random_uuid(), -- placeholder property_id
        auth.uid(),
        auth.uid(),
        CURRENT_DATE + INTERVAL '30 days',
        CURRENT_DATE + INTERVAL '1 year 30 days',
        2500.00,
        2500.00,
        12,
        '123 Test Street',
        'Test City',
        'Test State',
        '12345',
        'apartment',
        'Test Landlord',
        'landlord@test.com',
        'Test Tenant',
        'tenant@test.com',
        'draft'
    ) RETURNING id INTO v_contract_id;
    
    RETURN v_contract_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Lease contracts setup completed successfully!
-- =====================================================

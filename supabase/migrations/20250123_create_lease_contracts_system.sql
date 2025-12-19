-- Create lease_contracts table for Ontario Lease Form 2229E
CREATE TABLE IF NOT EXISTS public.lease_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.rental_applications(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id),
    landlord_id UUID NOT NULL REFERENCES auth.users(id),
    tenant_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Lease Terms
    lease_start_date DATE NOT NULL,
    lease_end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2),
    lease_duration_months INTEGER NOT NULL,
    
    -- Additional Terms & Policies
    pet_policy TEXT,
    smoking_policy TEXT,
    utilities_included TEXT[],
    parking_details TEXT,
    maintenance_responsibility TEXT,
    additional_terms TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_landlord_signature', 'pending_tenant_signature', 'fully_signed', 'executed', 'cancelled')),
    
    -- Signatures
    landlord_signature JSONB,
    tenant_signature JSONB,
    
    -- Metadata
    contract_template_version VARCHAR(50) DEFAULT '2229E',
    generated_by VARCHAR(50) DEFAULT 'system',
    electronic_signature_consent BOOLEAN DEFAULT false,
    terms_acceptance_landlord BOOLEAN DEFAULT false,
    terms_acceptance_tenant BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.lease_contracts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their lease contracts" ON public.lease_contracts
    FOR SELECT USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

CREATE POLICY "Landlords can create lease contracts" ON public.lease_contracts
    FOR INSERT WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Users can update their lease contracts" ON public.lease_contracts
    FOR UPDATE USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

-- Create views/functions for easier access
CREATE OR REPLACE FUNCTION generate_lease_contract(
  p_application_id UUID,
  p_lease_start_date DATE,
  p_lease_duration_months INTEGER,
  p_additional_terms TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_property_id UUID;
  v_landlord_id UUID;
  v_tenant_id UUID;
  v_rent NUMERIC;
  v_contract_id UUID;
BEGIN
  -- Get application details
  SELECT property_id, applicant_id
  INTO v_property_id, v_tenant_id
  FROM rental_applications
  WHERE id = p_application_id;
  
  -- Get property details
  SELECT user_id, monthly_rent
  INTO v_landlord_id, v_rent
  FROM properties
  WHERE id = v_property_id;
  
  -- Check if contract exists
  SELECT id INTO v_contract_id
  FROM lease_contracts
  WHERE application_id = p_application_id;
  
  IF v_contract_id IS NOT NULL THEN
    RETURN v_contract_id;
  END IF;

  -- Create new contract
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
    status,
    additional_terms,
    created_at,
    updated_at
  ) VALUES (
    p_application_id,
    v_property_id,
    v_landlord_id,
    v_tenant_id,
    p_lease_start_date,
    p_lease_start_date + (p_lease_duration_months || ' months')::INTERVAL,
    v_rent,
    v_rent, -- Default deposit
    p_lease_duration_months,
    'draft',
    p_additional_terms,
    NOW(),
    NOW()
  ) RETURNING id INTO v_contract_id;

  RETURN v_contract_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

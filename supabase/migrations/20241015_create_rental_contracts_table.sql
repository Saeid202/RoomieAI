-- Create contract status enum
CREATE TYPE contract_status AS ENUM (
  'draft',
  'pending_tenant',
  'pending_landlord', 
  'fully_executed',
  'rejected',
  'expired'
);

-- Create rental contracts table
CREATE TABLE IF NOT EXISTS rental_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contract content
  contract_terms TEXT NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2),
  lease_start_date DATE NOT NULL,
  lease_end_date DATE NOT NULL,
  
  -- Signing status
  status contract_status DEFAULT 'draft',
  
  -- Tenant signature
  tenant_signed_at TIMESTAMP WITH TIME ZONE,
  tenant_signature_data JSONB, -- Digital signature data
  tenant_ip_address INET,
  
  -- Landlord signature
  landlord_signed_at TIMESTAMP WITH TIME ZONE,
  landlord_signature_data JSONB,
  landlord_ip_address INET,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Contract expiration if not signed
  
  -- Contract document
  contract_pdf_url TEXT, -- Signed PDF storage URL
  
  -- Additional terms
  special_terms TEXT,
  utilities_included JSONB,
  pet_policy TEXT,
  smoking_allowed BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT valid_dates CHECK (lease_end_date > lease_start_date),
  CONSTRAINT valid_rent CHECK (monthly_rent > 0),
  CONSTRAINT valid_deposit CHECK (security_deposit IS NULL OR security_deposit >= 0)
);

-- Create indexes for better performance
CREATE INDEX idx_rental_contracts_property_id ON rental_contracts(property_id);
CREATE INDEX idx_rental_contracts_tenant_id ON rental_contracts(tenant_id);
CREATE INDEX idx_rental_contracts_landlord_id ON rental_contracts(landlord_id);
CREATE INDEX idx_rental_contracts_status ON rental_contracts(status);
CREATE INDEX idx_rental_contracts_created_at ON rental_contracts(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rental_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER rental_contracts_updated_at_trigger
  BEFORE UPDATE ON rental_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_contracts_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE rental_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Tenants can view contracts where they are the tenant
CREATE POLICY "Tenants can view their contracts" ON rental_contracts
  FOR SELECT USING (auth.uid() = tenant_id);

-- Landlords can view contracts where they are the landlord  
CREATE POLICY "Landlords can view their contracts" ON rental_contracts
  FOR SELECT USING (auth.uid() = landlord_id);

-- Landlords can create contracts for their properties
CREATE POLICY "Landlords can create contracts" ON rental_contracts
  FOR INSERT WITH CHECK (
    auth.uid() = landlord_id AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id AND user_id = auth.uid()
    )
  );

-- Both parties can update contracts (for signing)
CREATE POLICY "Contract parties can update" ON rental_contracts
  FOR UPDATE USING (
    auth.uid() = tenant_id OR auth.uid() = landlord_id
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON rental_contracts TO authenticated;
GRANT USAGE ON SEQUENCE rental_contracts_id_seq TO authenticated;

-- Comments for documentation
COMMENT ON TABLE rental_contracts IS 'Stores rental contracts requiring two-party digital signatures';
COMMENT ON COLUMN rental_contracts.status IS 'Current status of the contract signing process';
COMMENT ON COLUMN rental_contracts.tenant_signature_data IS 'JSON containing tenant signature image and metadata';
COMMENT ON COLUMN rental_contracts.landlord_signature_data IS 'JSON containing landlord signature image and metadata';
COMMENT ON COLUMN rental_contracts.expires_at IS 'When the contract expires if not fully signed';
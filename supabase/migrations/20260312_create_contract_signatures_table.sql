-- create_contract_signatures_table.sql
CREATE TABLE IF NOT EXISTS contract_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  contract_data JSONB NOT NULL,
  document_hash TEXT NOT NULL,
  
  -- Buyer signature
  buyer_id UUID,
  buyer_name_typed TEXT,
  buyer_signed_at TIMESTAMPTZ,
  buyer_ip_address TEXT,
  buyer_device_info TEXT,
  buyer_biometric_verified BOOLEAN DEFAULT false,
  
  -- Seller signature
  seller_id UUID,
  seller_name_typed TEXT,
  seller_signed_at TIMESTAMPTZ,
  seller_ip_address TEXT,
  seller_device_info TEXT,
  seller_biometric_verified BOOLEAN DEFAULT false,
  
  -- Lawyer signature
  lawyer_id UUID,
  lawyer_name_typed TEXT,
  lawyer_signed_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending',
  -- pending → buyer_signed → seller_signed → fully_executed
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE contract_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own signatures" ON contract_signatures FOR SELECT USING (
  auth.uid() = buyer_id OR
  auth.uid() = seller_id OR
  auth.uid() = lawyer_id
);

CREATE POLICY "Users can insert their own signatures" ON contract_signatures FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their own signatures" ON contract_signatures FOR UPDATE USING (
  auth.uid() = buyer_id OR
  auth.uid() = seller_id OR
  auth.uid() = lawyer_id
);

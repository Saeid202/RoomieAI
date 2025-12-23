-- Create a table for N4 Eviction Forms (Non-payment of Rent)
CREATE TABLE IF NOT EXISTS public.n4_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft', -- draft, finalized
    
    -- Part 1: Parties
    tenant_names TEXT,
    landlord_name TEXT,
    
    -- Address
    unit_address TEXT,
    unit_city TEXT,
    unit_province TEXT DEFAULT 'Ontario',
    unit_postal_code TEXT,
    
    -- Payment Details
    amount_owing DECIMAL(10, 2), -- The top-level amount field
    termination_date DATE,
    
    -- Rent Calculation Table
    rent_details JSONB DEFAULT '[]'::jsonb, -- Array of { period_from, period_to, charged, paid, owing }
    total_rent_owing DECIMAL(10, 2), -- Calculated total from table (should match amount_owing)

    -- Signature
    signature_first_name TEXT,
    signature_last_name TEXT,
    signature_phone TEXT,
    signature_date DATE,
    signature_is_rep BOOLEAN DEFAULT false,
    
    -- Representative Info
    representative_info JSONB DEFAULT '{}'::jsonb, -- { name, lsuc, company, phone, address, city, province, postal, fax }
    
    -- Office Use
    office_file_number TEXT,
    delivery_method JSONB DEFAULT '{}'::jsonb, -- { in_person: bool, mail: bool, ... }

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.n4_forms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own N4 forms"
    ON public.n4_forms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own N4 forms"
    ON public.n4_forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own N4 forms"
    ON public.n4_forms FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own N4 forms"
    ON public.n4_forms FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_n4_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_n4_forms_updated_at
    BEFORE UPDATE ON public.n4_forms
    FOR EACH ROW
    EXECUTE PROCEDURE update_n4_updated_at_column();

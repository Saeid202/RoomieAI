-- Create a table for N8 Eviction Forms
CREATE TABLE IF NOT EXISTS public.n8_forms (
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
    
    -- Termination
    termination_date DATE,
    
    -- Reasons
    reason1_selected BOOLEAN DEFAULT false, -- Persistent late payment
    reason2_selected BOOLEAN DEFAULT false, -- No longer qualify (subsidized)
    reason3_selected BOOLEAN DEFAULT false, -- Employment ended
    reason4_selected BOOLEAN DEFAULT false, -- Condo purchase agreement terminated
    reason5_selected BOOLEAN DEFAULT false, -- Rehab/Therapy ended
    
    -- Events/Details
    events_details JSONB DEFAULT '[]'::jsonb, -- Array of { date: string, details: string }
    
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
ALTER TABLE public.n8_forms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own N8 forms"
    ON public.n8_forms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own N8 forms"
    ON public.n8_forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own N8 forms"
    ON public.n8_forms FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own N8 forms"
    ON public.n8_forms FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_n8_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_n8_forms_updated_at
    BEFORE UPDATE ON public.n8_forms
    FOR EACH ROW
    EXECUTE PROCEDURE update_n8_updated_at_column();

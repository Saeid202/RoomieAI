-- Create a table for N12 Eviction Forms (Landlord's Own Use)
CREATE TABLE IF NOT EXISTS public.n12_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft', -- draft, finalized
    
    -- Part 1: Parties
    tenant_names TEXT,
    landlord_name TEXT,
    
    -- Address
    rental_address TEXT,
    
    -- Termination
    termination_date DATE,
    
    -- Reason Selection
    -- reason_type: 'landlord' (Reason 1) or 'purchaser' (Reason 2)
    reason_type TEXT, 
    
    -- Who is moving in? (Stores the specific checkbox value)
    -- e.g., 'me', 'spouse', 'child', 'parent', 'spouse_child', 'spouse_parent', 'caregiver'
    -- If purchaser: 'purchaser', 'purchaser_spouse', etc.
    occupant_details JSONB DEFAULT '{}'::jsonb, 
    
    -- Signature
    signature_first_name TEXT,
    signature_last_name TEXT,
    signature_phone TEXT,
    signature_date DATE,
    signature_is_rep BOOLEAN DEFAULT false,
    
    -- Representative Info
    representative_info JSONB DEFAULT '{}'::jsonb,
    
    -- Office Use
    office_file_number TEXT,
    delivery_method JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.n12_forms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own N12 forms"
    ON public.n12_forms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own N12 forms"
    ON public.n12_forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own N12 forms"
    ON public.n12_forms FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own N12 forms"
    ON public.n12_forms FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_n12_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_n12_forms_updated_at
    BEFORE UPDATE ON public.n12_forms
    FOR EACH ROW
    EXECUTE PROCEDURE update_n12_updated_at_column();

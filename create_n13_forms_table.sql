-- Create a table for N13 Eviction Forms (Demolition, Conversion, Repairs)
CREATE TABLE IF NOT EXISTS public.n13_forms (
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
    -- 'demolish' (Reason 1), 'repair' (Reason 2), 'convert' (Reason 3)
    reason TEXT, 
    
    -- Work Details
    -- Array of { work_planned: string, details: string }
    work_details JSONB DEFAULT '[]'::jsonb, 
    
    -- Permits
    -- 'obtained', 'will_obtain', 'not_required'
    permit_status TEXT,
    
    -- Signature
    signature_first_name TEXT,
    signature_last_name TEXT,
    signature_phone TEXT,
    signature_date DATE,
    signature_is_rep BOOLEAN DEFAULT false,
    signature_typed TEXT,
    
    -- Representative Info
    representative_info JSONB DEFAULT '{}'::jsonb,
    
    -- Office Use
    office_file_number TEXT,
    delivery_method JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.n13_forms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own N13 forms"
    ON public.n13_forms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own N13 forms"
    ON public.n13_forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own N13 forms"
    ON public.n13_forms FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own N13 forms"
    ON public.n13_forms FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_n13_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_n13_forms_updated_at
    BEFORE UPDATE ON public.n13_forms
    FOR EACH ROW
    EXECUTE PROCEDURE update_n13_updated_at_column();

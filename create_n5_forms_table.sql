-- Create a table for N5 Eviction Forms
CREATE TABLE IF NOT EXISTS public.n5_forms (
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
    -- Reason 1: Interference
    reason1_selected BOOLEAN DEFAULT false,
    reason1_notice_type TEXT, -- 'first', 'second'
    
    -- Reason 2: Damage
    reason2_selected BOOLEAN DEFAULT false,
    reason2_notice_type TEXT, -- 'first', 'second'
    reason2_details JSONB DEFAULT '{}'::jsonb, -- { repair: bool, replace: bool, pay_repair: bool, pay_repair_amount: number, ... }
    
    -- Reason 3: Overcrowding
    reason3_selected BOOLEAN DEFAULT false,
    reason3_notice_type TEXT, -- 'first', 'second'
    reason3_details JSONB DEFAULT '{}'::jsonb, -- { reduce_to_count: number }
    
    -- Events/Details
    events_details JSONB DEFAULT '[]'::jsonb, -- Array of { date: string, time: string, description: string }
    
    -- Signature
    schedule_hearing BOOLEAN DEFAULT false, -- Implicit from "If you disagree" section? No, just signature.
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
ALTER TABLE public.n5_forms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own N5 forms"
    ON public.n5_forms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own N5 forms"
    ON public.n5_forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own N5 forms"
    ON public.n5_forms FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own N5 forms"
    ON public.n5_forms FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_n5_forms_updated_at
    BEFORE UPDATE ON public.n5_forms
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

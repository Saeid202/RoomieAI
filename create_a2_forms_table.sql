-- Create a table for A2 Application (Sublet or Assignment)
CREATE TABLE IF NOT EXISTS public.a2_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft', -- draft, finalized
    
    -- Part 1: General Info
    applicant_type TEXT, -- 'tenant', 'landlord'
    applicant_first_name TEXT,
    applicant_last_name TEXT,
    applicant_company TEXT,
    applicant_address TEXT,
    applicant_unit TEXT,
    applicant_city TEXT,
    applicant_province TEXT DEFAULT 'Ontario',
    applicant_postal TEXT,
    applicant_phone_day TEXT,
    applicant_phone_eve TEXT,
    applicant_email TEXT,

    rental_address TEXT,
    related_files JSONB DEFAULT '[]'::jsonb, -- Array of file numbers
    
    -- Part 2: Tenant Reasons
    t_reason1_refused BOOLEAN DEFAULT false,
    t_r1_type TEXT, -- 'assign', 'sublet'
    t_r1_explanation TEXT,
    t_r1_remedy_authorize BOOLEAN DEFAULT false,
    t_r1_remedy_person TEXT,
    t_r1_remedy_end BOOLEAN DEFAULT false,
    t_r1_end_date DATE,
    t_r1_remedy_abatement BOOLEAN DEFAULT false,
    t_r1_abatement_amount DECIMAL(10, 2),
    t_r1_abatement_explanation TEXT,

    t_reason2_subtenant_stayed BOOLEAN DEFAULT false,
    t_r2_move_out_date DATE,
    t_r2_remedy_evict BOOLEAN DEFAULT false,
    t_r2_remedy_comp BOOLEAN DEFAULT false,
    t_r2_rent_paid DECIMAL(10, 2),
    t_r2_rent_period TEXT,

    -- Part 3: Landlord Reasons
    l_reason1_unauthorized BOOLEAN DEFAULT false,
    l_r1_aware_date DATE,
    l_r1_remedy_evict BOOLEAN DEFAULT false,
    l_r1_remedy_comp BOOLEAN DEFAULT false,
    l_r1_prev_rent DECIMAL(10, 2),
    l_r1_prev_rent_freq TEXT,
    
    nsf_charges JSONB DEFAULT '[]'::jsonb, -- Array of { cheque_amount, date, nsf_date, bank_charge, admin_charge, total }

    l_reason2_subtenant_stayed BOOLEAN DEFAULT false,
    l_r2_move_out_date DATE,

    l_reason3_refusal_reasonable BOOLEAN DEFAULT false,
    l_r3_explanation TEXT,
    
    -- Part 4: Signature
    signer_type TEXT, -- 'tenant', 'landlord', 'representative'
    signature_first_name TEXT,
    signature_last_name TEXT,
    signature_date DATE,
    
    -- Representative Info
    representative_info JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.a2_forms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own A2 forms"
    ON public.a2_forms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own A2 forms"
    ON public.a2_forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own A2 forms"
    ON public.a2_forms FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own A2 forms"
    ON public.a2_forms FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_a2_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_a2_forms_updated_at
    BEFORE UPDATE ON public.a2_forms
    FOR EACH ROW
    EXECUTE PROCEDURE update_a2_updated_at_column();

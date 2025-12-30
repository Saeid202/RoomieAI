-- Create a table for T1 Rebate Forms (Tenant Application for a Rebate of Money the Landlord Owes)
CREATE TABLE IF NOT EXISTS public.t1_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft', -- draft, finalized
    
    -- We'll store the bulk of the form data in a JSONB column to match React state
    form_data JSONB DEFAULT '{}'::jsonb,
    
    -- Useful for filtering/sorting/identifying at a glance
    rental_address TEXT,
    tenant_name TEXT,
    date_filed DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.t1_forms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own T1 forms"
    ON public.t1_forms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own T1 forms"
    ON public.t1_forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own T1 forms"
    ON public.t1_forms FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own T1 forms"
    ON public.t1_forms FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_t1_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_t1_forms_updated_at
    BEFORE UPDATE ON public.t1_forms
    FOR EACH ROW
    EXECUTE PROCEDURE update_t1_updated_at_column();

-- Create a table for T6 Forms (Tenant Application about Maintenance)
CREATE TABLE IF NOT EXISTS public.t6_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft', -- draft, finalized
    
    -- Bulk storage
    form_data JSONB DEFAULT '{}'::jsonb,
    
    -- Search/Metadata
    rental_address TEXT,
    tenant_name TEXT,
    date_filed DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.t6_forms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own T6 forms"
    ON public.t6_forms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own T6 forms"
    ON public.t6_forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own T6 forms"
    ON public.t6_forms FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own T6 forms"
    ON public.t6_forms FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_t6_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_t6_forms_updated_at
    BEFORE UPDATE ON public.t6_forms
    FOR EACH ROW
    EXECUTE PROCEDURE update_t6_updated_at_column();

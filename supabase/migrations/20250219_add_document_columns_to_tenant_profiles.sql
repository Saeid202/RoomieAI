-- Migration: Add document storage and financial information columns to tenant_profiles
-- Phase 1: Safe addition of new columns for document management

-- Add document URL columns (will store Supabase Storage URLs)
ALTER TABLE tenant_profiles 
ADD COLUMN IF NOT EXISTS reference_letters TEXT,
ADD COLUMN IF NOT EXISTS employment_letter TEXT,
ADD COLUMN IF NOT EXISTS credit_score_report TEXT,
ADD COLUMN IF NOT EXISTS additional_documents TEXT;

-- Add financial information
ALTER TABLE tenant_profiles 
ADD COLUMN IF NOT EXISTS monthly_income NUMERIC;

-- Add emergency contact information
ALTER TABLE tenant_profiles 
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;

-- Add comments for documentation
COMMENT ON COLUMN tenant_profiles.reference_letters IS 'URL to reference letters document in Supabase Storage';
COMMENT ON COLUMN tenant_profiles.employment_letter IS 'URL to employment letter document in Supabase Storage';
COMMENT ON COLUMN tenant_profiles.credit_score_report IS 'URL to credit score report document in Supabase Storage';
COMMENT ON COLUMN tenant_profiles.additional_documents IS 'URL to additional documents in Supabase Storage';
COMMENT ON COLUMN tenant_profiles.monthly_income IS 'Monthly income in dollars';
COMMENT ON COLUMN tenant_profiles.emergency_contact_name IS 'Emergency contact full name';
COMMENT ON COLUMN tenant_profiles.emergency_contact_phone IS 'Emergency contact phone number';
COMMENT ON COLUMN tenant_profiles.emergency_contact_relationship IS 'Relationship to emergency contact';

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the columns were added
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'tenant_profiles'
    AND column_name IN (
        'reference_letters',
        'employment_letter', 
        'credit_score_report',
        'additional_documents',
        'monthly_income',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship'
    )
ORDER BY column_name;

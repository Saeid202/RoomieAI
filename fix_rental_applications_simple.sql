-- Simple fix for rental_applications table
-- Add only the essential missing columns

-- Add missing columns to rental_applications table
ALTER TABLE public.rental_applications
ADD COLUMN IF NOT EXISTS reference_documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS employment_documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS credit_documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS additional_documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS signature_data TEXT NULL,
ADD COLUMN IF NOT EXISTS contract_signed BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Make agree_to_terms nullable and default to false
ALTER TABLE public.rental_applications
ALTER COLUMN agree_to_terms DROP NOT NULL,
ALTER COLUMN agree_to_terms SET DEFAULT FALSE;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'rental_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

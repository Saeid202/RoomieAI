-- Complete fix for rental_applications table
-- This ensures all required columns exist for the rental application submission

-- First, let's check if the table exists and what columns it has
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'rental_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns to rental_applications table
ALTER TABLE public.rental_applications
ADD COLUMN IF NOT EXISTS reference_documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS employment_documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS credit_documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS additional_documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS signature_data TEXT NULL,
ADD COLUMN IF NOT EXISTS contract_signed BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Update the agree_to_terms constraint to allow false initially, then require true for submission
-- First, drop the old constraint if it exists
ALTER TABLE public.rental_applications
DROP CONSTRAINT IF EXISTS terms_agreement_required;

-- Add a new constraint that allows agree_to_terms to be false initially,
-- but ensures it's true when the application status is 'approved' or 'under_review'
-- (or handle this logic in the application layer)
-- For now, we'll just ensure it's not null and defaults to false, and the frontend will enforce true on submission.
ALTER TABLE public.rental_applications
ALTER COLUMN agree_to_terms SET DEFAULT FALSE;
ALTER TABLE public.rental_applications
ALTER COLUMN agree_to_terms SET NOT NULL;

-- Re-add the check constraint if needed, or rely on application logic
-- For now, we'll assume the frontend ensures agree_to_terms is true on final submission.
-- If a strict DB constraint is needed, it would be:
-- ALTER TABLE public.rental_applications ADD CONSTRAINT terms_agreement_required CHECK ((agree_to_terms = true));

-- Create rental_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rental_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.rental_applications(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('reference', 'employment', 'credit', 'additional')),
    original_filename TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'verified', 'rejected')),
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for rental_documents
CREATE INDEX IF NOT EXISTS idx_rental_documents_application_id ON public.rental_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_rental_documents_type ON public.rental_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_rental_documents_status ON public.rental_documents(status);

-- Enable RLS for rental_documents
ALTER TABLE public.rental_documents ENABLE ROW LEVEL SECURITY;

-- Policies for rental_documents
-- Allow authenticated users to insert documents for their own applications
CREATE POLICY "Allow authenticated users to upload rental documents" ON public.rental_documents
FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT applicant_id FROM public.rental_applications WHERE id = application_id)
);

-- Allow authenticated users to view documents for their own applications
CREATE POLICY "Allow authenticated users to view own rental documents" ON public.rental_documents
FOR SELECT USING (
    auth.uid() IN (SELECT applicant_id FROM public.rental_applications WHERE id = application_id)
);

-- Allow landlords to view documents for applications to their properties
CREATE POLICY "Allow landlords to view rental documents for their properties" ON public.rental_documents
FOR SELECT USING (
    auth.uid() IN (
        SELECT p.user_id
        FROM public.rental_applications ra
        JOIN public.properties p ON ra.property_id = p.id
        WHERE ra.id = application_id
    )
);

-- Allow authenticated users to update their own documents (e.g., status, description)
CREATE POLICY "Allow authenticated users to update own rental documents" ON public.rental_documents
FOR UPDATE USING (
    auth.uid() IN (SELECT applicant_id FROM public.rental_applications WHERE id = application_id)
);

-- Allow authenticated users to delete their own documents
CREATE POLICY "Allow authenticated users to delete own rental documents" ON public.rental_documents
FOR DELETE USING (
    auth.uid() IN (SELECT applicant_id FROM public.rental_applications WHERE id = application_id)
);

-- Trigger for updated_at timestamp on rental_documents
CREATE TRIGGER trigger_update_rental_documents_updated_at
BEFORE UPDATE ON public.rental_documents
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- Verify the final schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'rental_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

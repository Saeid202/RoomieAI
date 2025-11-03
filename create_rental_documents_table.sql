-- =====================================================
-- Create rental_documents table
-- =====================================================
-- This script creates the rental_documents table with proper RLS policies
-- =====================================================

-- Create the rental_documents table
CREATE TABLE IF NOT EXISTS public.rental_documents (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    application_id UUID NOT NULL REFERENCES public.rental_applications(id) ON DELETE CASCADE,
    
    -- Document information
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN (
        'reference', 'employment', 'credit', 'additional'
    )),
    original_filename VARCHAR(255) NOT NULL,
    storage_url TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Document status and verification
    status VARCHAR(20) NOT NULL DEFAULT 'uploaded' CHECK (status IN (
        'uploaded', 'verified', 'rejected'
    )),
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    description TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_file_size CHECK (file_size_bytes > 0)
);

-- =====================================================
-- Indexes for better query performance
-- =====================================================

-- Index on application_id for finding documents for a specific application
CREATE INDEX IF NOT EXISTS idx_rental_documents_application_id ON public.rental_documents(application_id);

-- Index on document_type for filtering by document type
CREATE INDEX IF NOT EXISTS idx_rental_documents_type ON public.rental_documents(document_type);

-- Index on status for filtering by verification status
CREATE INDEX IF NOT EXISTS idx_rental_documents_status ON public.rental_documents(status);

-- Index on created_at for sorting by upload date
CREATE INDEX IF NOT EXISTS idx_rental_documents_created_at ON public.rental_documents(created_at);

-- Composite index for application + type queries
CREATE INDEX IF NOT EXISTS idx_rental_documents_app_type ON public.rental_documents(application_id, document_type);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on the table
ALTER TABLE public.rental_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view documents for their own applications
CREATE POLICY "Users can view documents for own applications" ON public.rental_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
    );

-- Policy: Users can insert documents for their own applications
CREATE POLICY "Users can insert documents for own applications" ON public.rental_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
    );

-- Policy: Users can update their own application documents (only if not verified)
CREATE POLICY "Users can update own application documents" ON public.rental_documents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
        AND status != 'verified'
    );

-- Policy: Users can delete their own application documents (only if not verified)
CREATE POLICY "Users can delete own application documents" ON public.rental_documents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
        AND status != 'verified'
    );

-- Policy: Property owners can view documents for applications on their properties
CREATE POLICY "Property owners can view documents for their property applications" ON public.rental_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rental_applications ra
            JOIN public.properties p ON ra.property_id = p.id
            WHERE ra.id = rental_documents.application_id 
            AND p.user_id = auth.uid()
        )
    );

-- Policy: Property owners can update document status for their property applications
CREATE POLICY "Property owners can update document status" ON public.rental_documents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.rental_applications ra
            JOIN public.properties p ON ra.property_id = p.id
            WHERE ra.id = rental_documents.application_id 
            AND p.user_id = auth.uid()
        )
    );

-- =====================================================
-- Triggers for automatic timestamp updates
-- =====================================================

-- Trigger to automatically update updated_at on row updates
CREATE OR REPLACE TRIGGER trg_rental_documents_updated
    BEFORE UPDATE ON public.rental_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Views for common queries
-- =====================================================

-- View for landlord document review
CREATE OR REPLACE VIEW public.landlord_documents_view AS
SELECT 
    rd.id as document_id,
    rd.application_id,
    rd.document_type,
    rd.original_filename,
    rd.storage_url,
    rd.file_size_bytes,
    rd.mime_type,
    rd.status,
    rd.verified_by,
    rd.verified_at,
    rd.rejection_reason,
    rd.description,
    rd.created_at as uploaded_at,
    ra.full_name as applicant_name,
    ra.email as applicant_email,
    p.listing_title as property_title,
    p.address as property_address
FROM public.rental_documents rd
JOIN public.rental_applications ra ON rd.application_id = ra.id
JOIN public.properties p ON ra.property_id = p.id
WHERE p.user_id = auth.uid()
ORDER BY rd.created_at DESC;

-- View for applicant document tracking
CREATE OR REPLACE VIEW public.applicant_documents_view AS
SELECT 
    rd.id as document_id,
    rd.application_id,
    rd.document_type,
    rd.original_filename,
    rd.file_size_bytes,
    rd.status,
    rd.verified_at,
    rd.rejection_reason,
    rd.created_at as uploaded_at,
    p.listing_title as property_title
FROM public.rental_documents rd
JOIN public.rental_applications ra ON rd.application_id = ra.id
JOIN public.properties p ON ra.property_id = p.id
WHERE ra.applicant_id = auth.uid()
ORDER BY rd.created_at DESC;

-- =====================================================
-- Sample data (optional - for testing)
-- =====================================================

-- Uncomment the following lines to insert sample data for testing
/*
-- This would require existing rental_applications records
INSERT INTO public.rental_documents (
    application_id,
    document_type,
    original_filename,
    storage_url,
    file_size_bytes,
    mime_type,
    description
) VALUES (
    (SELECT id FROM public.rental_applications LIMIT 1),
    'reference',
    'reference_letter.pdf',
    'https://example.com/documents/reference_letter.pdf',
    1024000,
    'application/pdf',
    'Reference letter from previous landlord'
);
*/

-- =====================================================
-- Rental documents table setup completed successfully!
-- =====================================================

-- =====================================================
-- REFINANCE DOCUMENTS SYSTEM
-- =====================================================
-- This migration creates a completely independent document management system
-- for refinancing applications, separate from mortgage_documents.
--
-- Features:
-- - refinance_documents table for storing document metadata
-- - refinance-documents storage bucket for file storage
-- - RLS policies for data security
-- - Storage policies for file access control
-- =====================================================

-- =====================================================
-- 1. CREATE REFINANCE_DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.refinance_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mortgage_profile_id UUID NOT NULL REFERENCES public.mortgage_profiles(id) ON DELETE CASCADE,
    
    -- Document classification
    document_category TEXT NOT NULL CHECK (document_category IN (
        'identity',
        'income',
        'self_employed',
        'property',
        'assets',
        'debt'
    )),
    document_type TEXT NOT NULL,
    
    -- File information
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL UNIQUE,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    
    -- Status tracking
    upload_status TEXT NOT NULL DEFAULT 'uploaded' CHECK (upload_status IN (
        'pending',
        'uploaded',
        'verified',
        'rejected'
    )),
    
    -- Verification tracking
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    notes TEXT,
    
    -- Metadata
    is_required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_refinance_documents_user_id 
    ON public.refinance_documents(user_id);

CREATE INDEX IF NOT EXISTS idx_refinance_documents_mortgage_profile_id 
    ON public.refinance_documents(mortgage_profile_id);

CREATE INDEX IF NOT EXISTS idx_refinance_documents_category 
    ON public.refinance_documents(document_category);

CREATE INDEX IF NOT EXISTS idx_refinance_documents_status 
    ON public.refinance_documents(upload_status);

CREATE INDEX IF NOT EXISTS idx_refinance_documents_created_at 
    ON public.refinance_documents(created_at DESC);

-- =====================================================
-- 3. CREATE UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_refinance_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_refinance_documents_updated_at
    BEFORE UPDATE ON public.refinance_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_refinance_documents_updated_at();

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.refinance_documents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- Policy: Users can view their own documents
CREATE POLICY "Users can view own refinance documents"
    ON public.refinance_documents
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

-- Policy: Mortgage brokers can view documents from profiles with consent
CREATE POLICY "Brokers can view refinance documents with consent"
    ON public.refinance_documents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.mortgage_profiles mp
            INNER JOIN public.user_profiles up ON mp.user_id = up.id
            WHERE mp.id = refinance_documents.mortgage_profile_id
            AND mp.broker_consent = true
            AND up.role = 'mortgage_broker'
            AND up.id = auth.uid()
        )
    );

-- Policy: Users can insert their own documents
CREATE POLICY "Users can insert own refinance documents"
    ON public.refinance_documents
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

-- Policy: Users can update their own documents
CREATE POLICY "Users can update own refinance documents"
    ON public.refinance_documents
    FOR UPDATE
    USING (
        auth.uid() = user_id
    )
    WITH CHECK (
        auth.uid() = user_id
    );

-- Policy: Brokers can update document status (verification)
CREATE POLICY "Brokers can update refinance document status"
    ON public.refinance_documents
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.mortgage_profiles mp
            INNER JOIN public.user_profiles up ON mp.user_id = up.id
            WHERE mp.id = refinance_documents.mortgage_profile_id
            AND mp.broker_consent = true
            AND up.role = 'mortgage_broker'
            AND up.id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.mortgage_profiles mp
            INNER JOIN public.user_profiles up ON mp.user_id = up.id
            WHERE mp.id = refinance_documents.mortgage_profile_id
            AND mp.broker_consent = true
            AND up.role = 'mortgage_broker'
            AND up.id = auth.uid()
        )
    );

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete own refinance documents"
    ON public.refinance_documents
    FOR DELETE
    USING (
        auth.uid() = user_id
    );

-- =====================================================
-- 6. CREATE STORAGE BUCKET
-- =====================================================

-- Insert storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'refinance-documents',
    'refinance-documents',
    false, -- Private bucket
    10485760, -- 10MB max file size
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/heic',
        'image/heif'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. CREATE STORAGE POLICIES
-- =====================================================

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload own refinance documents"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'refinance-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can view their own files
CREATE POLICY "Users can view own refinance documents"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'refinance-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Brokers can view files from profiles with consent
CREATE POLICY "Brokers can view refinance documents with consent"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'refinance-documents'
        AND EXISTS (
            SELECT 1
            FROM public.refinance_documents rd
            INNER JOIN public.mortgage_profiles mp ON rd.mortgage_profile_id = mp.id
            INNER JOIN public.user_profiles up ON mp.user_id = up.id
            WHERE rd.file_path = storage.objects.name
            AND mp.broker_consent = true
            AND up.role = 'mortgage_broker'
            AND up.id = auth.uid()
        )
    );

-- Policy: Users can update their own files
CREATE POLICY "Users can update own refinance documents"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'refinance-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'refinance-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own refinance documents"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'refinance-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.refinance_documents TO authenticated;

-- =====================================================
-- 9. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.refinance_documents IS 
    'Stores metadata for refinancing application documents. Completely independent from mortgage_documents table.';

COMMENT ON COLUMN public.refinance_documents.document_category IS 
    'Category: identity, income, self_employed, property, assets, debt';

COMMENT ON COLUMN public.refinance_documents.document_type IS 
    'Specific document type within the category (e.g., government_id, pay_stub, bank_statement)';

COMMENT ON COLUMN public.refinance_documents.upload_status IS 
    'Status: pending, uploaded, verified, rejected';

COMMENT ON COLUMN public.refinance_documents.is_required IS 
    'Whether this document type is required for the refinance application';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- The refinance documents system is now ready to use.
-- Next steps:
-- 1. Create TypeScript types (Phase 2)
-- 2. Create service layer (Phase 3)
-- 3. Create UI components (Phase 4-5)
-- 4. Integrate with mortgage profile page (Phase 6)
-- =====================================================

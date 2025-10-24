-- Quick setup for rental documents system
-- Run this in Supabase SQL Editor to ensure document saving works

-- =====================================================
-- 1. CREATE STORAGE BUCKET (if not exists)
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rental-documents',
  'rental-documents', 
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- =====================================================
-- 2. CREATE DATABASE TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.rental_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('reference', 'employment', 'credit', 'additional')),
    original_filename VARCHAR(255) NOT NULL,
    storage_url TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'rental_documents_application_id_fkey'
        AND table_name = 'rental_documents'
    ) THEN
        ALTER TABLE public.rental_documents 
        ADD CONSTRAINT rental_documents_application_id_fkey 
        FOREIGN KEY (application_id) REFERENCES public.rental_applications(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_rental_documents_application_id ON public.rental_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_rental_documents_type ON public.rental_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_rental_documents_status ON public.rental_documents(status);

-- =====================================================
-- 4. ENABLE RLS AND CREATE POLICIES
-- =====================================================
ALTER TABLE public.rental_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view documents for own applications" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can insert documents for own applications" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can update own application documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can delete own application documents" ON public.rental_documents;

-- Create new policies
CREATE POLICY "Users can view documents for own applications" ON public.rental_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert documents for own applications" ON public.rental_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own application documents" ON public.rental_documents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own application documents" ON public.rental_documents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
    );

-- =====================================================
-- 5. STORAGE BUCKET POLICIES
-- =====================================================
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Tenants can upload their own rental documents" ON storage.objects;
DROP POLICY IF EXISTS "Tenants can view their own rental documents" ON storage.objects;
DROP POLICY IF EXISTS "Tenants can delete their own rental documents" ON storage.objects;

-- Create storage policies
CREATE POLICY "Tenants can upload their own rental documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'rental-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Tenants can view their own rental documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'rental-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Tenants can delete their own rental documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'rental-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 6. VERIFICATION
-- =====================================================
SELECT 'Setup completed successfully!' as status;

-- Check bucket
SELECT 'Storage bucket status:' as info, name, public, file_size_limit FROM storage.buckets WHERE name = 'rental-documents';

-- Check table structure
SELECT 'Database table columns:' as info, column_name, data_type FROM information_schema.columns WHERE table_name = 'rental_documents' ORDER BY ordinal_position;

-- Check policies
SELECT 'RLS policies created:' as info, policyname FROM pg_policies WHERE tablename = 'rental_documents';

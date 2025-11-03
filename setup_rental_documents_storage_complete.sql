-- Complete setup for rental-documents storage bucket and database table
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. CREATE STORAGE BUCKET
-- =====================================================

-- Create rental-documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rental-documents',
  'rental-documents', 
  false, -- Not public by default
  10485760, -- 10MB file size limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- =====================================================
-- 2. CREATE DATABASE TABLE
-- =====================================================

-- Create rental_documents table if it doesn't exist
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
    ) THEN
        ALTER TABLE public.rental_documents 
        ADD CONSTRAINT rental_documents_application_id_fkey 
        FOREIGN KEY (application_id) REFERENCES public.rental_applications(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- Index on application_id for faster queries
CREATE INDEX IF NOT EXISTS idx_rental_documents_application_id ON public.rental_documents(application_id);

-- Index on document_type for filtering
CREATE INDEX IF NOT EXISTS idx_rental_documents_type ON public.rental_documents(document_type);

-- Index on status for filtering by verification status
CREATE INDEX IF NOT EXISTS idx_rental_documents_status ON public.rental_documents(status);

-- Index on created_at for sorting by upload date
CREATE INDEX IF NOT EXISTS idx_rental_documents_created_at ON public.rental_documents(created_at);

-- Composite index for application + type queries
CREATE INDEX IF NOT EXISTS idx_rental_documents_app_type ON public.rental_documents(application_id, document_type);

-- =====================================================
-- 4. ENABLE RLS AND CREATE POLICIES
-- =====================================================

-- Enable RLS on the table
ALTER TABLE public.rental_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view documents for own applications" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can insert documents for own applications" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can update own application documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can delete own application documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Landlords can view documents for their properties" ON public.rental_documents;

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

-- Policy: Landlords can view documents for their properties
CREATE POLICY "Landlords can view documents for their properties" ON public.rental_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rental_applications ra
            JOIN public.properties p ON ra.property_id = p.id
            WHERE ra.id = rental_documents.application_id 
            AND p.user_id = auth.uid()
        )
    );

-- =====================================================
-- 5. STORAGE BUCKET RLS POLICIES
-- =====================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Tenants can upload their own rental documents" ON storage.objects;
DROP POLICY IF EXISTS "Tenants can view their own rental documents" ON storage.objects;
DROP POLICY IF EXISTS "Landlords can view documents for their properties" ON storage.objects;
DROP POLICY IF EXISTS "Landlords can download documents for their properties" ON storage.objects;
DROP POLICY IF EXISTS "Tenants can delete their own rental documents" ON storage.objects;

-- Policy: Tenants can upload their own rental documents
CREATE POLICY "Tenants can upload their own rental documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'rental-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Tenants can view their own rental documents
CREATE POLICY "Tenants can view their own rental documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'rental-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Landlords can view documents for their properties
CREATE POLICY "Landlords can view documents for their properties" ON storage.objects
FOR SELECT USING (
  bucket_id = 'rental-documents'
  AND EXISTS (
    SELECT 1 FROM rental_applications ra
    JOIN properties p ON ra.property_id = p.id
    WHERE ra.id::text = (storage.foldername(name))[2]
    AND p.user_id = auth.uid()
  )
);

-- Policy: Landlords can download documents for their properties
CREATE POLICY "Landlords can download documents for their properties" ON storage.objects
FOR SELECT USING (
  bucket_id = 'rental-documents'
  AND EXISTS (
    SELECT 1 FROM rental_applications ra
    JOIN properties p ON ra.property_id = p.id
    WHERE ra.id::text = (storage.foldername(name))[2]
    AND p.user_id = auth.uid()
  )
);

-- Policy: Tenants can delete their own rental documents
CREATE POLICY "Tenants can delete their own rental documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'rental-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 6. VERIFICATION QUERIES
-- =====================================================

-- Verify the setup
SELECT 'Storage bucket created successfully' as status;
SELECT name, public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE name = 'rental-documents';

SELECT 'Database table created successfully' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rental_documents' 
ORDER BY ordinal_position;

SELECT 'RLS policies created successfully' as status;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'rental_documents';

SELECT 'Storage policies created successfully' as status;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%rental%';

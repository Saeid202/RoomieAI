-- Complete fix for rental documents system
-- Run this in Supabase SQL Editor if verification shows issues

-- =====================================================
-- 1. CREATE STORAGE BUCKET (if missing)
-- =====================================================

-- Create rental-documents bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rental-documents',
  'rental-documents', 
  false, -- Private bucket for security
  10485760, -- 10MB file size limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- =====================================================
-- 2. CREATE DATABASE TABLE (if missing)
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
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
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
-- 3. CREATE INDEXES (if missing)
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rental_documents_application_id ON public.rental_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_rental_documents_type ON public.rental_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_rental_documents_status ON public.rental_documents(status);
CREATE INDEX IF NOT EXISTS idx_rental_documents_created_at ON public.rental_documents(created_at);

-- =====================================================
-- 4. ENABLE RLS AND CREATE POLICIES
-- =====================================================

-- Enable RLS on the table
ALTER TABLE public.rental_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Property owners can view documents for their applications" ON public.rental_documents;

-- Create new RLS policies
CREATE POLICY "Users can view their own documents" ON public.rental_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own documents" ON public.rental_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own documents" ON public.rental_documents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own documents" ON public.rental_documents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
    );

CREATE POLICY "Property owners can view documents for their applications" ON public.rental_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rental_applications ra
            JOIN public.properties p ON p.id = ra.property_id
            WHERE ra.id = rental_documents.application_id 
            AND p.user_id = auth.uid()
        )
    );

-- =====================================================
-- 5. CREATE STORAGE POLICIES
-- =====================================================

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload rental documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own rental documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own rental documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own rental documents" ON storage.objects;
DROP POLICY IF EXISTS "Property owners can view rental documents" ON storage.objects;

-- Create storage policies
CREATE POLICY "Users can upload rental documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'rental-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own rental documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'rental-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own rental documents" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'rental-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own rental documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'rental-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Property owners can view rental documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'rental-documents' AND
        EXISTS (
            SELECT 1 FROM public.rental_applications ra
            JOIN public.properties p ON p.id = ra.property_id
            WHERE ra.id::text = (storage.foldername(name))[2]
            AND p.user_id = auth.uid()
        )
    );

-- =====================================================
-- 6. VERIFICATION
-- =====================================================

-- Verify the setup
SELECT 'Rental documents system setup completed successfully!' as status;

-- Check bucket
SELECT 'Storage bucket:' as component, id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'rental-documents';

-- Check table
SELECT 'Database table:' as component, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'rental_documents';

-- Check policies
SELECT 'RLS policies created:' as component, COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'rental_documents';

-- Check storage policies
SELECT 'Storage policies created:' as component, COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%rental%';

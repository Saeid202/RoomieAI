-- Create the rental-documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('rental-documents', 'rental-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Safely drop existing policies to ensure idempotency
DROP POLICY IF EXISTS "Rental Docs Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Rental Docs Auth Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Rental Docs Owner Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Rental Docs Owner Delete Access" ON storage.objects;

-- Policy to allow public read access to the bucket
CREATE POLICY "Rental Docs Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'rental-documents' );

-- Policy to allow authenticated users to upload documents
CREATE POLICY "Rental Docs Auth Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'rental-documents' );

-- Policy to allow owners to update their documents
CREATE POLICY "Rental Docs Owner Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'rental-documents' AND owner = auth.uid() );

-- Policy to allow owners to delete their documents
CREATE POLICY "Rental Docs Owner Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'rental-documents' AND owner = auth.uid() );

-- Create the rental_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rental_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.rental_applications(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'reference', 'employment', 'credit', 'additional'
  original_filename TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),
  description TEXT,
  status VARCHAR(20) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the table
ALTER TABLE public.rental_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on rental_documents to ensure idempotency
DROP POLICY IF EXISTS "Users can view own documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Landlords can view documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Landlords can update document status" ON public.rental_documents;

-- Policies for rental_documents table

-- Users can view documents for their own applications
CREATE POLICY "Users can view own documents"
ON public.rental_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.rental_applications
    WHERE rental_applications.id = rental_documents.application_id
    AND rental_applications.applicant_id = auth.uid()
  )
);

-- Landlords can view documents for applications to their properties
CREATE POLICY "Landlords can view documents"
ON public.rental_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.rental_applications
    JOIN public.properties ON properties.id = rental_applications.property_id
    WHERE rental_applications.id = rental_documents.application_id
    AND properties.user_id = auth.uid()
  )
);

-- Users can insert documents for their own applications
CREATE POLICY "Users can insert own documents"
ON public.rental_documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.rental_applications
    WHERE rental_applications.id = rental_documents.application_id
    AND rental_applications.applicant_id = auth.uid()
  )
);

-- Users can delete their own documents (if status is not verified?)
CREATE POLICY "Users can delete own documents"
ON public.rental_documents
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.rental_applications
    WHERE rental_applications.id = rental_documents.application_id
    AND rental_applications.applicant_id = auth.uid()
  )
);

-- Landlords can update status (verify/reject)
CREATE POLICY "Landlords can update document status"
ON public.rental_documents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.rental_applications
    JOIN public.properties ON properties.id = rental_applications.property_id
    WHERE rental_applications.id = rental_documents.application_id
    AND properties.user_id = auth.uid()
  )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_rental_documents_application_id ON public.rental_documents(application_id);

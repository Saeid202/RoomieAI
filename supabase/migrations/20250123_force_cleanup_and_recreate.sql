-- First, remove any orphaned objects referring to this bucket
DELETE FROM storage.objects WHERE bucket_id = 'rental-documents';

-- Then delete the bucket record
DELETE FROM storage.buckets WHERE id = 'rental-documents';

-- Re-create the rental-documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rental-documents', 
  'rental-documents', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/png', 'image/jpeg', 'application/pdf']
);

-- Safely recreate policies
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

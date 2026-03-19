-- Setup RLS policies for construction-product-documents bucket
-- These policies allow authenticated users to upload and delete, and public to read

-- First, ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated uploads to construction-product-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from construction-product-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from construction-product-documents" ON storage.objects;

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to construction-product-documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'construction-product-documents');

-- Policy 2: Allow public to read/download files
CREATE POLICY "Allow public read from construction-product-documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'construction-product-documents');

-- Policy 3: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated delete from construction-product-documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'construction-product-documents');

-- Check if property-documents bucket exists
SELECT id, name, public FROM storage.buckets WHERE name = 'property-documents';

-- Check current storage object policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view property documents" ON storage.objects;
DROP POLICY IF EXISTS "Only owners can view documents" ON storage.objects;

-- Create policy: Allow authenticated users to read all files in property-documents bucket
CREATE POLICY "Authenticated users can read property documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'property-documents');

-- Create policy: Allow users to upload to their own property folders
CREATE POLICY "Users can upload to property-documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-documents'
);

-- Create policy: Allow users to update their own uploads
CREATE POLICY "Users can update their uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'property-documents' AND owner = auth.uid());

-- Create policy: Allow users to delete their own uploads
CREATE POLICY "Users can delete their uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'property-documents' AND owner = auth.uid());

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

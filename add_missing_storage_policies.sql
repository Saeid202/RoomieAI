-- Add missing storage policies for property-documents bucket

-- Policy for SELECT (reading files) - allow public access since bucket is public
CREATE POLICY IF NOT EXISTS "Public can read property documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-documents');

-- Policy for UPDATE (updating file metadata)
CREATE POLICY IF NOT EXISTS "Users can update their property documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-documents'
  AND auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'property-documents'
  AND auth.uid() = owner
);

-- Policy for DELETE (deleting files)
CREATE POLICY IF NOT EXISTS "Users can delete their property documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-documents'
  AND auth.uid() = owner
);

-- Verify all policies
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%property-documents%'
ORDER BY cmd, policyname;

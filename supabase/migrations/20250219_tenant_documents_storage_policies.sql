-- Storage policies for tenant-documents bucket
-- Allow landlords to view/download documents from applicants

-- Policy 1: Users can upload/manage their own documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tenant-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tenant-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'tenant-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'tenant-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can view their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'tenant-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Landlords can view documents from applicants who applied to their properties
CREATE POLICY "Landlords can view applicant documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'tenant-documents'
  AND EXISTS (
    SELECT 1
    FROM rental_applications ra
    INNER JOIN properties p ON p.id = ra.property_id
    WHERE (storage.foldername(name))[1] = ra.applicant_id::text
      AND p.user_id = auth.uid()
  )
);

-- Verify policies were created
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%tenant%'
ORDER BY policyname;

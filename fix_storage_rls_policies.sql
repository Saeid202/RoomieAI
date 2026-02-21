-- =====================================================
-- Fix Storage RLS Policies for property-documents
-- =====================================================
-- This allows authenticated users to upload, view, and manage property documents
-- =====================================================

-- Check existing policies on storage.objects table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%property-documents%'
ORDER BY policyname;

-- Drop existing policies if they exist (to recreate them correctly)
DROP POLICY IF EXISTS "Allow authenticated users to upload property documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read property documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow property owners to delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow property owners to update documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to property documents" ON storage.objects;

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload property documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-documents'
);

-- Policy 2: Allow public read access (since bucket is public)
CREATE POLICY "Allow public read access to property documents"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'property-documents'
);

-- Policy 3: Allow property owners to delete their documents
CREATE POLICY "Allow property owners to delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-documents'
  AND auth.uid() = owner
);

-- Policy 4: Allow property owners to update their documents
CREATE POLICY "Allow property owners to update documents"
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

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%property-documents%'
ORDER BY policyname;

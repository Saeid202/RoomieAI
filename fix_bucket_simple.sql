-- =====================================================
-- Simple Bucket Fix - Manual Creation
-- =====================================================
-- Just create the bucket manually, skip complex policies for now
-- =====================================================

-- Check if bucket exists
SELECT 
  id, 
  name, 
  public
FROM storage.buckets 
WHERE name = 'property-documents';

-- If it doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-documents',
  'property-documents',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']::text[];

-- =====================================================
-- Simple Storage Policies
-- =====================================================

-- Drop all existing property-documents policies
DO $$ 
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%property%document%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads to property-documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-documents'
);

-- Policy 2: Allow users to view their own uploads
CREATE POLICY "Allow users to view property-documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'property-documents'
  AND owner_id::text = auth.uid()::text
);

-- Policy 3: Allow users to update their own uploads
CREATE POLICY "Allow users to update property-documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-documents'
  AND owner_id::text = auth.uid()::text
);

-- Policy 4: Allow users to delete their own uploads
CREATE POLICY "Allow users to delete property-documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-documents'
  AND owner_id::text = auth.uid()::text
);

-- =====================================================
-- Verification
-- =====================================================

SELECT 
  '✅ Bucket created' as status,
  name,
  public,
  file_size_limit / 1024 / 1024 as size_limit_mb
FROM storage.buckets 
WHERE name = 'property-documents';

SELECT 
  '✅ Policies created' as status,
  policyname
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%property-documents%'
ORDER BY policyname;

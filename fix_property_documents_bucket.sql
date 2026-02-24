-- =====================================================
-- Fix property-documents Storage Bucket
-- =====================================================

-- Check if bucket exists
SELECT 
  id, 
  name, 
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'property-documents';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-documents',
  'property-documents',
  false, -- Private bucket
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']::text[];

-- =====================================================
-- Storage Policies for property-documents bucket
-- =====================================================

-- Drop existing policies (if they exist)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Property owners can upload documents" ON storage.objects;
  DROP POLICY IF EXISTS "Property owners can view their documents" ON storage.objects;
  DROP POLICY IF EXISTS "Property owners can update their documents" ON storage.objects;
  DROP POLICY IF EXISTS "Property owners can delete their documents" ON storage.objects;
  DROP POLICY IF EXISTS "Buyers with access can view documents" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Policy 1: Authenticated users can upload documents to their properties
CREATE POLICY "Property owners can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-documents'
  AND auth.uid() IS NOT NULL
);

-- Policy 2: Users can view documents they own or have access to
CREATE POLICY "Property owners can view their documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'property-documents'
  AND (
    -- Owner can view their own property documents
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM properties WHERE user_id = auth.uid()
    )
    OR
    -- Users with approved access can view
    (storage.foldername(name))[1] IN (
      SELECT property_id::text 
      FROM document_access_requests 
      WHERE user_id = auth.uid() 
        AND status = 'approved'
    )
  )
);

-- Policy 3: Property owners can update their documents
CREATE POLICY "Property owners can update their documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM properties WHERE user_id = auth.uid()
  )
);

-- Policy 4: Property owners can delete their documents
CREATE POLICY "Property owners can delete their documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM properties WHERE user_id = auth.uid()
  )
);

-- Note: Buyer access is now included in Policy 2 above

-- =====================================================
-- Verification
-- =====================================================

-- Check bucket exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'property-documents') THEN
    RAISE EXCEPTION 'Bucket property-documents was not created';
  END IF;
  
  RAISE NOTICE '✅ Bucket property-documents configured successfully!';
END $$;

-- Show bucket configuration
SELECT 
  '✅ Bucket Configuration:' as status,
  name,
  public,
  file_size_limit / 1024 / 1024 as size_limit_mb,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'property-documents';

-- Show policies
SELECT 
  '✅ Storage Policies:' as status,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%property%'
ORDER BY policyname;

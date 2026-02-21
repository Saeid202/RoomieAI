-- =====================================================
-- Fix Property Documents Bucket - Make it Public
-- =====================================================
-- IMPORTANT: Direct SQL updates to storage.buckets don't work in Supabase
-- You need to use the Supabase Dashboard or Storage API instead
-- =====================================================

-- OPTION 1: Use Supabase Dashboard (RECOMMENDED)
-- 1. Go to: https://supabase.com/dashboard/project/bjesofgfbuyzjamyliys/storage/buckets
-- 2. Find "property-documents" bucket
-- 3. Click the three dots menu (⋮) next to it
-- 4. Click "Edit bucket"
-- 5. Toggle "Public bucket" to ON
-- 6. Click "Save"

-- OPTION 2: Verify current bucket status
SELECT 
  id,
  name, 
  public,
  created_at,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'property-documents';

-- OPTION 3: Check if there are any storage policies blocking access
SELECT 
  id,
  name,
  bucket_id,
  definition,
  check_expression
FROM storage.policies 
WHERE bucket_id = 'property-documents';

-- OPTION 4: If no policies exist, create basic RLS policies for the bucket
-- (Only run if the query above returns no results)

-- Allow authenticated users to read files
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read property documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'property-documents');

-- Allow property owners to upload files
CREATE POLICY IF NOT EXISTS "Allow property owners to upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-documents' 
  AND auth.uid() IN (
    SELECT landlord_id FROM properties 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Allow property owners to delete their files
CREATE POLICY IF NOT EXISTS "Allow property owners to delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-documents' 
  AND auth.uid() IN (
    SELECT landlord_id FROM properties 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

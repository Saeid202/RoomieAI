-- Complete fix for property image upload issues
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. CREATE PROPERTY-IMAGES STORAGE BUCKET
-- =====================================================

-- Create the property-images bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true, -- Public bucket for easy access
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- =====================================================
-- 2. ENABLE RLS ON STORAGE
-- =====================================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. DROP EXISTING POLICIES (to avoid conflicts)
-- =====================================================

DROP POLICY IF EXISTS "Property images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Property images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;

-- =====================================================
-- 4. CREATE NEW STORAGE POLICIES
-- =====================================================

-- Policy: Anyone can view property images (public access)
CREATE POLICY "Public can view property images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'property-images');

-- Policy: Authenticated users can upload property images
CREATE POLICY "Authenticated users can upload property images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Policy: Users can update their own property images
CREATE POLICY "Users can update their own property images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own property images
CREATE POLICY "Users can delete their own property images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 5. VERIFICATION
-- =====================================================

-- Check if bucket was created successfully
SELECT 'Storage bucket created successfully' as status;
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'property-images';

-- Check if policies were created
SELECT 'Storage policies created successfully' as status;
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%property%';

-- Test bucket access
SELECT 'Testing bucket access...' as status;
SELECT COUNT(*) as object_count 
FROM storage.objects 
WHERE bucket_id = 'property-images';

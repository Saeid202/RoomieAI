-- Complete storage setup for property images
-- Run this in your Supabase SQL Editor

-- 1. Create the property-images storage bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Property images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Property images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;

-- 4. Create new, comprehensive policies

-- Allow public read access to property images
CREATE POLICY "Property images are publicly viewable" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'property-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload property images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'property-images' AND
  auth.role() = 'authenticated'
);

-- Allow users to update their own images
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

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own property images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Verify the setup
SELECT 'Storage bucket created successfully' as status;
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'property-images';

SELECT 'Storage policies created successfully' as status;
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%property%'
ORDER BY policyname;

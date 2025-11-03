-- Fixed Property Images Storage Setup
-- Run this in Supabase SQL Editor

-- 1. Create the property-images bucket
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

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;

-- 3. Create new policies
CREATE POLICY "Public can view property images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Users can delete their own property images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Verify setup
SELECT 'Property images bucket setup completed' as status;
SELECT id, name, public FROM storage.buckets WHERE id = 'property-images';

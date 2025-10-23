-- Fix RLS policies for property-images storage bucket
-- This will allow authenticated users to upload images

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete property images" ON storage.objects;

-- Create new policies that allow authenticated users to manage property images
CREATE POLICY "Users can upload property images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can view property images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete property images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

-- Alternative: Make the bucket completely public for testing
UPDATE storage.buckets 
SET public = true 
WHERE id = 'property-images';

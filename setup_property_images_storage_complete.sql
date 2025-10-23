-- Complete setup for property-images storage bucket
-- Run this in your Supabase SQL Editor

-- Create the property-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Users can upload property images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to update their own images
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

-- Create policy to allow users to delete their own images
CREATE POLICY "Users can delete their own property images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow public read access to property images
CREATE POLICY "Property images are publicly viewable" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'property-images');

-- Verify the bucket was created successfully
SELECT * FROM storage.buckets WHERE id = 'property-images';
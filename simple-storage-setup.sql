-- Simple storage setup that works with standard Supabase permissions
-- Run this in your Supabase SQL Editor

-- 1. Create the property-images storage bucket
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

-- 2. Verify the bucket was created
SELECT 'Bucket created successfully' as status;
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'property-images';

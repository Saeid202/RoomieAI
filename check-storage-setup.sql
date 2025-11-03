-- Check storage bucket setup for property images
-- Run this in your Supabase SQL Editor

-- 1. Check if the property-images bucket exists
SELECT * FROM storage.buckets WHERE id = 'property-images';

-- 2. Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%property%';

-- 3. Check if there are any files in the bucket
SELECT * FROM storage.objects WHERE bucket_id = 'property-images' LIMIT 10;

-- 4. Check properties table for images
SELECT id, listing_title, images FROM properties WHERE images IS NOT NULL AND array_length(images, 1) > 0 LIMIT 5;

-- 5. Check if storage bucket is public
SELECT id, name, public FROM storage.buckets WHERE id = 'property-images';

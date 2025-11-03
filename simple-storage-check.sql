-- Simple storage check that works with standard permissions
-- Run this in your Supabase SQL Editor

-- 1. Check if the property-images bucket exists
SELECT 'Storage Bucket Check:' as check_type;
SELECT id, name, public, file_size_limit, allowed_mime_types, created_at 
FROM storage.buckets 
WHERE id = 'property-images';

-- 2. Check if there are any files in the bucket
SELECT 'Files in Bucket:' as check_type;
SELECT name, bucket_id, created_at, updated_at
FROM storage.objects 
WHERE bucket_id = 'property-images' 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Check if we can access the storage (this will show permission issues)
SELECT 'Storage Access Test:' as check_type;
SELECT count(*) as file_count 
FROM storage.objects 
WHERE bucket_id = 'property-images';

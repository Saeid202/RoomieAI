-- Debug storage setup for property images
-- Run this in your Supabase SQL Editor to check current configuration

-- 1. Check if the property-images bucket exists
SELECT 'Storage Buckets:' as check_type;
SELECT id, name, public, file_size_limit, allowed_mime_types, created_at 
FROM storage.buckets 
WHERE id = 'property-images';

-- 2. Check storage policies
SELECT 'Storage Policies:' as check_type;
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%property%'
ORDER BY policyname;

-- 3. Check if there are any files in the bucket
SELECT 'Files in Bucket:' as check_type;
SELECT name, bucket_id, created_at, updated_at, metadata
FROM storage.objects 
WHERE bucket_id = 'property-images' 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Check RLS status on storage.objects
SELECT 'RLS Status:' as check_type;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 5. Test if we can list files (this will show any permission issues)
SELECT 'Test List Files:' as check_type;
SELECT count(*) as file_count 
FROM storage.objects 
WHERE bucket_id = 'property-images';

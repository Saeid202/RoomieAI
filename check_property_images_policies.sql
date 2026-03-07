-- Check property-images bucket configuration and policies
-- Run this in Supabase SQL Editor to verify storage setup

-- Check bucket exists and configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE name = 'property-images';

-- Check all policies for property-images bucket
SELECT 
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (policyname ILIKE '%property%' OR policyname ILIKE '%image%')
ORDER BY cmd, policyname;

-- Check if current user can delete from property-images
-- This will show if the DELETE policy is working
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

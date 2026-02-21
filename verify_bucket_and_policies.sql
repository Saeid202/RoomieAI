-- Verify bucket is now public
SELECT name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE name = 'property-documents';

-- Check if there are any storage policies
SELECT 
  id,
  name,
  bucket_id,
  definition,
  check_expression
FROM storage.policies 
WHERE bucket_id = 'property-documents';

-- If no policies exist, we may need to add them
-- Check what objects are in the bucket
SELECT 
  name,
  bucket_id,
  owner,
  created_at,
  metadata
FROM storage.objects 
WHERE bucket_id = 'property-documents'
LIMIT 5;

-- Check what files actually exist in storage
SELECT 
  name as storage_file_name,
  id as storage_file_id,
  created_at as uploaded_at
FROM storage.objects
WHERE bucket_id = 'property-documents'
  AND name LIKE '45b129b2-3f36-406f-8fe0-558016bc8f6f/%'
ORDER BY created_at DESC;

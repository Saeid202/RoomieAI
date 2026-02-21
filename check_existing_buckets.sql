-- List all storage buckets
SELECT id, name, public, created_at FROM storage.buckets ORDER BY created_at DESC;

-- Check where the property document files actually are
SELECT 
  bucket_id,
  name,
  created_at
FROM storage.objects 
WHERE name LIKE '%a4accdd2-0cf4-4416-80fb-0b47b7beb917%'
ORDER BY created_at DESC
LIMIT 20;

-- Check if property-images bucket exists
SELECT 
    id, 
    name, 
    public, 
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE name = 'property-images';

-- Check storage policies for property-images
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (
    policyname ILIKE '%property%image%' 
    OR policyname ILIKE '%property-images%'
  )
ORDER BY cmd, policyname;

-- If no results, check all storage policies
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY cmd, policyname;

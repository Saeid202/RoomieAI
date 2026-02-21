-- Check what buckets actually exist in Supabase
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name LIKE '%property%' OR name LIKE '%document%';

-- Check the file_url pattern in property_documents table
SELECT file_url 
FROM property_documents 
LIMIT 5;

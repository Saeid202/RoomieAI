-- Check property_documents table for this property
SELECT 
  id,
  property_id,
  document_type,
  document_label,
  is_public,
  deleted_at,
  uploaded_at,
  file_name
FROM property_documents 
WHERE property_id = 'a4accdd2-0cf4-4416-80fb-0b47b7beb917'
ORDER BY uploaded_at DESC;

-- Check if there are ANY documents in the table
SELECT COUNT(*) as total_documents FROM property_documents;

-- Check storage bucket to see what files exist
SELECT 
  name,
  created_at
FROM storage.objects 
WHERE bucket_id = 'property-documents'
  AND name LIKE 'a4accdd2-0cf4-4416-80fb-0b47b7beb917%'
ORDER BY created_at DESC;

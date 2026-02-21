-- Check recent document uploads
SELECT 
  pd.id,
  pd.property_id,
  pd.document_type,
  pd.document_label,
  pd.file_name,
  pd.file_size,
  pd.is_public,
  pd.uploaded_at,
  pd.uploaded_by,
  p.listing_title,
  p.listing_category
FROM property_documents pd
LEFT JOIN properties p ON p.id = pd.property_id
WHERE pd.uploaded_at > NOW() - INTERVAL '1 hour'
ORDER BY pd.uploaded_at DESC;

-- Check if there are any documents in storage for recent properties
SELECT 
  name as file_path,
  bucket_id,
  created_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'property-documents'
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Check the most recent property created
SELECT 
  id,
  listing_title,
  listing_category,
  created_at,
  user_id
FROM properties
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 5;

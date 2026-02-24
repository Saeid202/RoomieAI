-- Check ALL documents for this property (including deleted)
SELECT 
  id,
  document_type,
  file_name,
  file_url,
  deleted_at,
  updated_at,
  CASE 
    WHEN deleted_at IS NOT NULL THEN '🗑️ DELETED'
    ELSE '✅ ACTIVE'
  END as status
FROM property_documents
WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
ORDER BY updated_at DESC;

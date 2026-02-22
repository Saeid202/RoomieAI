-- Check current documents for property db8e5787-a221-4381-a148-9aa360b474a4

-- 1. Check property_documents table
SELECT 
  id,
  document_type,
  file_url,
  deleted_at,
  CASE 
    WHEN deleted_at IS NULL THEN '✅ ACTIVE'
    ELSE '🗑️ DELETED'
  END as status
FROM property_documents
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
ORDER BY created_at DESC;

-- 2. Check processing status
SELECT 
  document_id,
  status,
  total_chunks,
  processed_chunks,
  error_message,
  started_at,
  completed_at
FROM property_document_processing_status
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
ORDER BY created_at DESC;

-- 3. Check embeddings
SELECT 
  document_id,
  document_type,
  COUNT(*) as embedding_count
FROM property_document_embeddings
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
GROUP BY document_id, document_type;

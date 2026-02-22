-- Debug why UI shows "processing" when document is completed

-- 1. Check processing status table
SELECT 
  document_id,
  property_id,
  status,
  total_chunks,
  processed_chunks,
  started_at,
  completed_at,
  error_message,
  updated_at
FROM property_document_processing_status
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
ORDER BY updated_at DESC;

-- 2. Check if embeddings exist
SELECT 
  COUNT(*) as total_embeddings,
  document_id,
  document_type
FROM property_document_embeddings
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
GROUP BY document_id, document_type;

-- 3. Check all documents for this property
SELECT 
  id,
  document_type,
  file_url,
  uploaded_at,
  deleted_at
FROM property_documents
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
  AND deleted_at IS NULL
ORDER BY uploaded_at DESC;

-- 4. Check if there's a mismatch
SELECT 
  pd.id as document_id,
  pd.document_type,
  ps.status,
  ps.total_chunks,
  ps.processed_chunks,
  CASE 
    WHEN ps.status IS NULL THEN 'No status record'
    WHEN ps.status = 'completed' THEN 'Completed'
    WHEN ps.status = 'processing' THEN 'Still processing'
    WHEN ps.status = 'failed' THEN 'Failed'
    ELSE ps.status
  END as status_description
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
  AND pd.deleted_at IS NULL
ORDER BY pd.uploaded_at DESC;

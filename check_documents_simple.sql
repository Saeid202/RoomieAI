-- Simple check: Do documents exist?
SELECT COUNT(*) as total_documents
FROM property_documents
WHERE deleted_at IS NULL;

-- Simple check: Do processing status records exist?
SELECT COUNT(*) as total_status_records
FROM property_document_processing_status;

-- Simple check: Do embeddings exist?
SELECT COUNT(*) as total_embeddings
FROM property_document_embeddings;

-- Show recent documents with their status
SELECT 
  pd.id as doc_id,
  pd.document_type,
  pd.file_name,
  ps.status,
  ps.error_message
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.deleted_at IS NULL
ORDER BY pd.updated_at DESC
LIMIT 5;

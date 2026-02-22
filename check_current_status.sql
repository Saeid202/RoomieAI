-- Check current processing status
SELECT 
  pd.document_type,
  ps.status,
  ps.total_chunks,
  ps.processed_chunks,
  ps.error_message,
  ps.completed_at,
  CASE 
    WHEN ps.status = 'completed' THEN '✅ Ready'
    WHEN ps.status = 'processing' THEN '🔄 Processing'
    WHEN ps.status = 'pending' THEN '⏳ Pending'
    WHEN ps.status = 'failed' THEN '❌ Failed'
    ELSE '❓ Unknown'
  END as status_display
FROM property_documents pd
JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
  AND pd.deleted_at IS NULL
ORDER BY pd.updated_at DESC;

-- Check if embeddings were created
SELECT 
  'Embeddings created' as check_name,
  COUNT(*) as total_embeddings,
  COUNT(DISTINCT document_id) as documents_with_embeddings
FROM property_document_embeddings
WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f';

-- Check Edge Function logs (if any errors)
SELECT 
  ps.document_id,
  ps.status,
  ps.error_message,
  ps.retry_count
FROM property_document_processing_status ps
WHERE ps.property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
  AND (ps.status = 'failed' OR ps.error_message IS NOT NULL);

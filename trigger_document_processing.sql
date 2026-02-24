-- =====================================================
-- Manually Trigger Document Processing
-- =====================================================
-- This creates processing status records for documents
-- that were uploaded but never processed
-- =====================================================

-- Insert processing status records for documents without status
INSERT INTO property_document_processing_status (
  document_id,
  property_id,
  status,
  total_chunks,
  processed_chunks,
  created_at,
  updated_at
)
SELECT 
  pd.id as document_id,
  pd.property_id,
  'pending' as status,
  0 as total_chunks,
  0 as processed_chunks,
  NOW() as created_at,
  NOW() as updated_at
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.deleted_at IS NULL
  AND ps.id IS NULL  -- Only documents without status
ON CONFLICT (document_id) DO NOTHING;

-- Show what was created
SELECT 
  'Processing status records created' as result,
  COUNT(*) as total_created
FROM property_document_processing_status
WHERE created_at > NOW() - INTERVAL '1 minute';

-- Show current status
SELECT 
  pd.id as doc_id,
  pd.document_type,
  pd.file_name,
  ps.status,
  pd.file_url
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.deleted_at IS NULL
ORDER BY pd.updated_at DESC
LIMIT 10;

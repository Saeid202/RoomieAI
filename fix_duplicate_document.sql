-- Fix duplicate document record
-- Both documents point to the same PDF file, but one is already processed

-- Option 1: Mark as completed (since the file is already processed)
UPDATE property_document_processing_status
SET 
  status = 'completed',
  completed_at = NOW(),
  total_chunks = 859,
  processed_chunks = 859,
  error_message = 'Duplicate of already processed document',
  updated_at = NOW()
WHERE document_id = '4ea873ff-aa83-48f3-9748-1d0bec5eaba4';

-- Verify both documents now show as completed
SELECT 
  pd.id,
  pd.document_type,
  pd.document_label,
  ps.status,
  ps.total_chunks,
  ps.error_message
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
  AND pd.deleted_at IS NULL
ORDER BY pd.uploaded_at DESC;

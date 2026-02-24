-- Delete the duplicate document record entirely
-- This is cleaner than having two records for the same file

-- First, delete the processing status
DELETE FROM property_document_processing_status
WHERE document_id = '4ea873ff-aa83-48f3-9748-1d0bec5eaba4';

-- Then, soft-delete the document record
UPDATE property_documents
SET deleted_at = NOW()
WHERE id = '4ea873ff-aa83-48f3-9748-1d0bec5eaba4';

-- Verify only one document remains
SELECT 
  pd.id,
  pd.document_type,
  pd.document_label,
  pd.deleted_at,
  ps.status,
  ps.total_chunks
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
ORDER BY pd.uploaded_at DESC;

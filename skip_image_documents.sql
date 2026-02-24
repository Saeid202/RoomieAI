-- Mark image documents as "failed" with specific message so they don't show as "processing"
UPDATE property_document_processing_status
SET 
  status = 'failed',
  error_message = 'Image files not supported - PDF processing only',
  updated_at = NOW()
WHERE document_id IN (
  SELECT id FROM property_documents
  WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
    AND (file_name ILIKE '%.jpeg' OR file_name ILIKE '%.jpg' OR file_name ILIKE '%.png')
    AND deleted_at IS NULL
);

-- Verify the update
SELECT 
  pd.document_type,
  pd.file_name,
  ps.status,
  ps.error_message
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
  AND pd.deleted_at IS NULL
ORDER BY pd.document_type;

-- Fix processing status for successfully processed document
-- The document was processed (859 chunks created) but status wasn't updated

UPDATE property_document_processing_status
SET 
  status = 'completed',
  completed_at = NOW(),
  total_chunks = 859,
  processed_chunks = 859,
  error_message = NULL,
  updated_at = NOW()
WHERE document_id = '8a22e588-590e-4a59-93c9-d0a5e59af009';

-- Verify the update
SELECT 
  document_id,
  status,
  total_chunks,
  processed_chunks,
  completed_at,
  error_message
FROM property_document_processing_status
WHERE document_id = '8a22e588-590e-4a59-93c9-d0a5e59af009';

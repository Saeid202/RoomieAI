-- Delete the survey_plan document that has no file in storage
UPDATE property_documents
SET deleted_at = NOW()
WHERE id = '8f7650f5-8a66-41b5-97f7-00a231c314b7'
  AND property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f';

-- Verify deletion
SELECT 
  id,
  document_type,
  file_name,
  deleted_at,
  CASE 
    WHEN deleted_at IS NOT NULL THEN '🗑️ DELETED'
    ELSE '✅ ACTIVE'
  END as status
FROM property_documents
WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
ORDER BY deleted_at NULLS FIRST, updated_at DESC;

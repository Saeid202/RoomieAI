-- Check what status values are allowed
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'property_document_processing_status'::regclass
  AND conname LIKE '%status%';

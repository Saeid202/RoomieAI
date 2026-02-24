-- Find the newly uploaded PDF document
SELECT 
  id,
  document_type,
  file_name,
  file_url,
  updated_at
FROM property_documents
WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
  AND file_name LIKE '%property_tax_bill_1771714598182%'
  AND deleted_at IS NULL
ORDER BY updated_at DESC
LIMIT 1;

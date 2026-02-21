-- Check current file URLs in property_documents table
SELECT id, file_url, document_type, document_label
FROM property_documents
LIMIT 5;

-- If URLs contain 'property-documents' (hyphen), we need to update them to 'property_documents' (underscore)
-- UPDATE property_documents
-- SET file_url = REPLACE(file_url, 'property-documents', 'property_documents')
-- WHERE file_url LIKE '%property-documents%';

-- Check what bucket actually exists
SELECT * FROM storage.buckets WHERE name LIKE '%property%';

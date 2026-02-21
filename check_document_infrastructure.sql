-- Check property_documents table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'property_documents'
ORDER BY ordinal_position;

-- Check if property-documents bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'property-documents';

-- Check existing documents for the property
SELECT id, property_id, document_type, document_label, file_name, is_public, uploaded_at
FROM property_documents
WHERE property_id = 'a4accdd2-0cf4-4416-80fb-0b47b7beb917'
ORDER BY uploaded_at DESC;

-- Check document type constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%document_type%';

-- Create document record for the uploaded file
-- Property: db8e5787-a221-4381-a148-9aa360b474a4
-- File: title_deed_1771717270702.pdf

INSERT INTO property_documents (
  property_id,
  document_type,
  document_label,
  file_url,
  file_name,
  mime_type,
  uploaded_by
)
VALUES (
  'db8e5787-a221-4381-a148-9aa360b474a4',
  'title_deed',
  'Title Deed',
  'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/db8e5787-a221-4381-a148-9aa360b474a4/title_deed_1771717270702.pdf',
  'title_deed_1771717270702.pdf',
  'application/pdf',
  (SELECT user_id FROM properties WHERE id = 'db8e5787-a221-4381-a148-9aa360b474a4')
)
RETURNING id, document_type, document_label, file_url;

-- Verify it was created
SELECT 
  id,
  document_type,
  document_label,
  file_name,
  file_url,
  uploaded_at
FROM property_documents
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
  AND deleted_at IS NULL;

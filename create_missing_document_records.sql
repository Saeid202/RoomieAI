-- Create property_documents records for the uploaded files
-- Based on the storage files we saw earlier

INSERT INTO property_documents (
  property_id,
  document_type,
  document_label,
  file_url,
  file_name,
  file_size,
  mime_type,
  is_public,
  uploaded_by
) VALUES
-- Title Deed
('a4accdd2-0cf4-4416-80fb-0b47b7beb917', 'title_deed', 'Title Deed', 
 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/a4accdd2-0cf4-4416-80fb-0b47b7beb917/title_deed_1771636486219.pdf',
 'title_deed_1771636486219.pdf', 100000, 'application/pdf', false, '05979fd9-3da8-45b4-8999-aa784f046bf4'),

-- Property Tax Bill (latest)
('a4accdd2-0cf4-4416-80fb-0b47b7beb917', 'property_tax_bill', 'Property Tax Bill', 
 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/a4accdd2-0cf4-4416-80fb-0b47b7beb917/property_tax_bill_1771636771482.pdf',
 'property_tax_bill_1771636771482.pdf', 100000, 'application/pdf', false, '05979fd9-3da8-45b4-8999-aa784f046bf4'),

-- Disclosures (latest)
('a4accdd2-0cf4-4416-80fb-0b47b7beb917', 'disclosures', 'Disclosures', 
 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/a4accdd2-0cf4-4416-80fb-0b47b7beb917/disclosures_1771636775641.pdf',
 'disclosures_1771636775641.pdf', 100000, 'application/pdf', false, '05979fd9-3da8-45b4-8999-aa784f046bf4'),

-- Status Certificate
('a4accdd2-0cf4-4416-80fb-0b47b7beb917', 'status_certificate', 'Status Certificate', 
 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/a4accdd2-0cf4-4416-80fb-0b47b7beb917/status_certificate_1771636499345.pdf',
 'status_certificate_1771636499345.pdf', 100000, 'application/pdf', false, '05979fd9-3da8-45b4-8999-aa784f046bf4'),

-- Condo Bylaws
('a4accdd2-0cf4-4416-80fb-0b47b7beb917', 'condo_bylaws', 'Condo Bylaws', 
 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/a4accdd2-0cf4-4416-80fb-0b47b7beb917/condo_bylaws_1771636504788.pdf',
 'condo_bylaws_1771636504788.pdf', 100000, 'application/pdf', false, '05979fd9-3da8-45b4-8999-aa784f046bf4');

-- Verify the records were created
SELECT 
  id,
  property_id,
  document_type,
  document_label,
  is_public,
  uploaded_at
FROM property_documents 
WHERE property_id = 'a4accdd2-0cf4-4416-80fb-0b47b7beb917'
ORDER BY uploaded_at DESC;

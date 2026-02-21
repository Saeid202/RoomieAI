-- Check if property has documents and listing_category
SELECT 
  id,
  listing_title,
  listing_category,
  sales_price,
  monthly_rent,
  user_id
FROM properties 
WHERE id = 'a4accdd2-0cf4-4416-80fb-0b47b7beb917';

-- Check documents for this property
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

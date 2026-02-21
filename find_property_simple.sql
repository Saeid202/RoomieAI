-- Simple query to find your property without sales_price column

-- Check what columns exist in properties table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;

-- Find property by ID
SELECT 
  id,
  listing_title,
  listing_category,
  property_category,
  property_configuration,
  monthly_rent,
  created_at,
  user_id
FROM properties
WHERE id = '3877de5d-dc70-4995-a92c-da4ac59a159b';

-- Get your most recent properties
SELECT 
  id,
  listing_title,
  listing_category,
  property_category,
  monthly_rent,
  created_at
FROM properties
ORDER BY created_at DESC
LIMIT 10;

-- Check if there are documents for this property
SELECT 
  id,
  property_id,
  document_type,
  document_label,
  is_public,
  uploaded_at
FROM property_documents
WHERE property_id = '3877de5d-dc70-4995-a92c-da4ac59a159b'
  AND deleted_at IS NULL;

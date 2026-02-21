-- Find the property you're viewing
-- The URL shows: 3877de5d-dc70-4995-a92c-da4ac59a159b

-- Check if it exists in properties table
SELECT 'properties' as table_name, id, listing_title, listing_category, sales_price, monthly_rent
FROM properties
WHERE id = '3877de5d-dc70-4995-a92c-da4ac59a159b';

-- Check if it exists in sales_listings table
SELECT 'sales_listings' as table_name, id, listing_title, sales_price
FROM sales_listings
WHERE id = '3877de5d-dc70-4995-a92c-da4ac59a159b';

-- Search by partial ID (in case of typo)
SELECT 'properties' as table_name, id, listing_title, listing_category, created_at
FROM properties
WHERE id::text LIKE '%3877de5d%'
ORDER BY created_at DESC;

-- Get your most recent properties (as the logged-in user)
SELECT 
  id,
  listing_title,
  listing_category,
  property_category,
  sales_price,
  monthly_rent,
  created_at
FROM properties
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;

-- Check if there are any documents uploaded recently
SELECT 
  pd.id,
  pd.property_id,
  pd.document_label,
  pd.uploaded_at,
  p.listing_title
FROM property_documents pd
LEFT JOIN properties p ON p.id = pd.property_id
WHERE pd.uploaded_by = auth.uid()
ORDER BY pd.uploaded_at DESC
LIMIT 10;

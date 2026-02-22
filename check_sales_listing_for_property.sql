-- Check sales listings for property db8e5787-a221-4381-a148-9aa360b474a4
SELECT 
  id,
  property_id,
  listing_price,
  listing_status,
  created_at,
  updated_at
FROM sales_listings
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
ORDER BY created_at DESC;

-- Count how many exist
SELECT COUNT(*) as total_listings
FROM sales_listings
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4';

-- Check what listing_category values exist in properties table
SELECT 
  id,
  listing_title,
  listing_category,
  status,
  monthly_rent,
  city,
  state
FROM properties
WHERE status IN ('active', 'available')
ORDER BY created_at DESC
LIMIT 20;

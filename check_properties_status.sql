-- Check current properties and their status
SELECT 
  id,
  listing_title,
  status,
  user_id,
  city,
  monthly_rent,
  created_at
FROM properties
ORDER BY created_at DESC
LIMIT 10;

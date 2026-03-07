-- Check if the "53, Mandarin Crescent" property still exists in database

SELECT 
  id,
  listing_title,
  city,
  state,
  monthly_rent,
  status,
  created_at
FROM properties
WHERE user_id = auth.uid()
  AND listing_title LIKE '%Mandarin%';

-- If this returns rows, the property still exists
-- If it returns 0 rows, it's just a browser cache issue

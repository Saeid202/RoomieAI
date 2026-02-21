-- Check listing_category for all properties
SELECT 
  id,
  listing_title,
  listing_category,
  sales_price,
  monthly_rent,
  created_at
FROM properties
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%shaba%' OR email LIKE '%mehdi%')
ORDER BY created_at DESC;

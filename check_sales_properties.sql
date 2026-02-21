-- Check all your sales properties and their co-ownership status
SELECT 
  id,
  listing_title,
  listing_category,
  is_co_ownership,
  sales_price,
  created_at
FROM properties
WHERE listing_category = 'sale'
ORDER BY created_at DESC;

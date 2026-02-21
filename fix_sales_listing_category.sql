-- Fix listing_category for properties that have sales_price but no listing_category set
UPDATE properties
SET listing_category = 'sale'
WHERE sales_price IS NOT NULL 
  AND sales_price > 0
  AND (listing_category IS NULL OR listing_category = 'rental');

-- Show the updated properties
SELECT 
  id,
  listing_title,
  listing_category,
  sales_price,
  monthly_rent
FROM properties
WHERE sales_price IS NOT NULL AND sales_price > 0
ORDER BY created_at DESC;

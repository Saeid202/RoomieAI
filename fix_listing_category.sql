-- Fix existing properties that don't have listing_category set
-- This will set listing_category based on whether they have sales_price or monthly_rent

-- Update properties with sales_price to be 'sale' listings
UPDATE properties
SET listing_category = 'sale'
WHERE sales_price IS NOT NULL 
  AND sales_price > 0
  AND (listing_category IS NULL OR listing_category = 'rental');

-- Update properties with monthly_rent to be 'rental' listings
UPDATE properties
SET listing_category = 'rental'
WHERE monthly_rent IS NOT NULL 
  AND monthly_rent > 0
  AND (listing_category IS NULL OR listing_category = 'sale');

-- Check results
SELECT 
  id,
  listing_title,
  listing_category,
  sales_price,
  monthly_rent,
  property_category,
  property_configuration
FROM properties
ORDER BY created_at DESC
LIMIT 20;

-- Count by category
SELECT 
  listing_category,
  COUNT(*) as count
FROM properties
GROUP BY listing_category;

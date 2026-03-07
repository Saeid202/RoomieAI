-- Check the bedroom data for the property in the screenshot
-- The URL shows: db8e5787-a221-4381-a148-9aa360b474a4

SELECT 
  id,
  listing_title,
  address,
  bedrooms,
  bathrooms,
  listing_category,
  sales_price,
  monthly_rent,
  property_type
FROM properties
WHERE id = 'db8e5787-a221-4381-a148-9aa360b474a4';

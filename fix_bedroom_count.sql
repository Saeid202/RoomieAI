-- Fix the bedroom count for this property
-- Extract the number from property_type "Condo - 1-Bedroom"

UPDATE properties
SET bedrooms = 1
WHERE id = 'db8e5787-a221-4381-a148-9aa360b474a4';

-- Verify the fix
SELECT 
  id,
  listing_title,
  bedrooms,
  bathrooms,
  property_type
FROM properties
WHERE id = 'db8e5787-a221-4381-a148-9aa360b474a4';

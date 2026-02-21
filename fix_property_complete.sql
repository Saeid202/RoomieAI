-- Fix the property by setting category and configuration
-- Change these values to match what you actually selected:
UPDATE properties
SET 
    property_category = 'Condo',  -- Change if different
    property_configuration = '1-Bedroom'  -- Change if different
WHERE id = 'a4accdd2-0cf4-4416-80fb-0b47b7beb917';

-- Verify the update
SELECT 
    id,
    listing_title,
    listing_category,
    property_category,
    property_configuration,
    sales_price
FROM properties
WHERE id = 'a4accdd2-0cf4-4416-80fb-0b47b7beb917';

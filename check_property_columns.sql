-- Check if property_category, property_configuration, and sales_price columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'properties'
  AND column_name IN ('property_category', 'property_configuration', 'sales_price')
ORDER BY column_name;

-- Also check what columns DO exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;

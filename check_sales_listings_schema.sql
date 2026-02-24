-- Check the actual schema of sales_listings table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'sales_listings'
ORDER BY ordinal_position;

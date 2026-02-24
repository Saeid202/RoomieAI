-- Check the actual schema of property_documents table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'property_documents'
ORDER BY ordinal_position;

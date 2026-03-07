-- Verify landlord_availability table exists in current database

-- Check if table exists
SELECT 
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_name = 'landlord_availability';

-- If it exists, show its columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'landlord_availability'
ORDER BY ordinal_position;

-- Check current database name
SELECT current_database();

-- Check if you're connected to the right project
SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE tablename LIKE '%landlord%' OR tablename LIKE '%viewing%'
ORDER BY tablename;

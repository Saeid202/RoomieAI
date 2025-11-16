-- Check work_exchange_offers table structure
-- This query will show all existing columns and help identify what's missing

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'work_exchange_offers'
ORDER BY ordinal_position;


-- Check properties table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name IN ('owner_id', 'user_id', 'landlord_id')
ORDER BY column_name;

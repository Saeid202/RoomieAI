-- Check the exact column names in property_viewing_appointments table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'property_viewing_appointments'
ORDER BY ordinal_position;

-- Check if there's a landlord_id column
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'property_viewing_appointments' 
  AND column_name = 'landlord_id'
) as has_landlord_id_column;

-- Check the most recent appointment to see what data was actually inserted
SELECT *
FROM property_viewing_appointments
ORDER BY created_at DESC
LIMIT 1;

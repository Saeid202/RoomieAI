-- Verification query to check if all required columns exist
-- This will show only the columns that the application code expects

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'work_exchange_offers'
  AND column_name IN (
    'user_id',
    'user_name',
    'user_email',
    'space_type',
    'work_requested',
    'duration',
    'work_hours_per_week',
    'address',
    'city',
    'state',
    'zip_code',
    'amenities_provided',
    'additional_notes',
    'images',
    'contact_preference',
    'status',
    'created_at',
    'updated_at'
  )
ORDER BY 
  CASE column_name
    WHEN 'user_id' THEN 1
    WHEN 'user_name' THEN 2
    WHEN 'user_email' THEN 3
    WHEN 'space_type' THEN 4
    WHEN 'work_requested' THEN 5
    WHEN 'duration' THEN 6
    WHEN 'work_hours_per_week' THEN 7
    WHEN 'address' THEN 8
    WHEN 'city' THEN 9
    WHEN 'state' THEN 10
    WHEN 'zip_code' THEN 11
    WHEN 'amenities_provided' THEN 12
    WHEN 'additional_notes' THEN 13
    WHEN 'images' THEN 14
    WHEN 'contact_preference' THEN 15
    WHEN 'status' THEN 16
    WHEN 'created_at' THEN 17
    WHEN 'updated_at' THEN 18
  END;

-- If this query returns 18 rows, all required columns are present!
-- If it returns fewer rows, some columns are still missing.


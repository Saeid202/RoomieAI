-- Check if property_viewing_appointments table exists and its schema

-- Check table existence
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'property_viewing_appointments'
) as table_exists;

-- Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'property_viewing_appointments'
ORDER BY ordinal_position;

-- If table doesn't exist, run the migration
-- You need to run: supabase/migrations/20260227_property_viewing_appointments.sql

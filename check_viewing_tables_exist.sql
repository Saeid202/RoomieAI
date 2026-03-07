-- Check if viewing appointment tables exist

-- Check for landlord_availability table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'landlord_availability'
) as landlord_availability_exists;

-- Check for property_viewing_appointments table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'property_viewing_appointments'
) as viewing_appointments_exists;

-- If they don't exist, we need to run the migration
-- The migration file is: supabase/migrations/20260227_property_viewing_appointments.sql

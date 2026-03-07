-- Check if the landlord_id column exists
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'property_viewing_appointments'
AND column_name = 'landlord_id';

-- If the above returns a row, the migration was run
-- If it returns nothing, you need to run the migration

-- Check if there are any appointments at all
SELECT 
  COUNT(*) as total_appointments,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as recent_appointments
FROM property_viewing_appointments;

-- Check the most recent appointment (if any)
SELECT 
  pva.id,
  pva.property_id,
  pva.landlord_id,
  pva.requester_name,
  pva.appointment_date,
  pva.appointment_time,
  pva.status,
  pva.created_at,
  p.address as property_address,
  p.user_id as property_owner_id
FROM property_viewing_appointments pva
LEFT JOIN properties p ON pva.property_id = p.id
ORDER BY pva.created_at DESC
LIMIT 5;

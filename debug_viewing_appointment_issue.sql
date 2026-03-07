-- Debug: Check if viewing appointment was created and why it's not showing

-- 1. Check all viewing appointments in the system
SELECT 
  id,
  property_id,
  requester_id,
  requester_name,
  appointment_date,
  appointment_time,
  status,
  created_at
FROM property_viewing_appointments
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check the property and its owner
SELECT 
  p.id as property_id,
  p.address,
  p.listing_category,
  p.user_id as landlord_id,
  u.email as landlord_email
FROM properties p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE p.address LIKE '%Yonge%'
ORDER BY p.created_at DESC
LIMIT 5;

-- 3. Check if there's a mismatch between appointment.landlord_id and property.user_id
SELECT 
  pva.id as appointment_id,
  pva.property_id,
  pva.landlord_id as appointment_landlord_id,
  p.user_id as property_owner_id,
  CASE 
    WHEN pva.landlord_id = p.user_id THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as landlord_match,
  pva.requester_name,
  pva.appointment_date,
  pva.status
FROM property_viewing_appointments pva
LEFT JOIN properties p ON pva.property_id = p.id
ORDER BY pva.created_at DESC
LIMIT 10;

-- 4. Check RLS policies for property_viewing_appointments
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'property_viewing_appointments'
ORDER BY policyname;

-- 5. Test the exact query used by getLandlordAppointments
-- Replace 'YOUR_LANDLORD_USER_ID' with the actual landlord's user ID
-- You can find it by checking the properties table for the Yonge Street property
SELECT 
  pva.*,
  p.address,
  p.listing_title,
  p.city,
  p.listing_category,
  p.user_id
FROM property_viewing_appointments pva
INNER JOIN properties p ON pva.property_id = p.id
WHERE p.user_id = 'YOUR_LANDLORD_USER_ID'
ORDER BY pva.appointment_date, pva.appointment_time;

-- 6. Check if there are any appointments at all
SELECT COUNT(*) as total_appointments
FROM property_viewing_appointments;

-- 7. Check the most recent appointment details
SELECT 
  pva.id,
  pva.property_id,
  pva.landlord_id,
  pva.requester_id,
  pva.requester_name,
  pva.appointment_date,
  pva.appointment_time,
  pva.status,
  pva.created_at,
  p.address as property_address,
  p.user_id as property_owner_id,
  landlord.email as landlord_email,
  requester.email as requester_email
FROM property_viewing_appointments pva
LEFT JOIN properties p ON pva.property_id = p.id
LEFT JOIN auth.users landlord ON pva.landlord_id = landlord.id
LEFT JOIN auth.users requester ON pva.requester_id = requester.id
ORDER BY pva.created_at DESC
LIMIT 1;

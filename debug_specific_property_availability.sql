-- Debug: Why isn't availability showing for this property?
-- Based on your screenshot showing "Slots: 0"

-- Step 1: Find the property you're viewing (from the URL: 8152a9ad-bbe6-4d77-b392-e57fa273b965)
SELECT 
  id as property_id,
  user_id as landlord_id,
  listing_title,
  address,
  city,
  state,
  status
FROM properties
WHERE id = '8152a9ad-bbe6-4d77-b392-e57fa273b965';

-- Step 2: Check if this landlord has ANY availability
SELECT 
  la.id,
  la.user_id,
  la.property_id,
  la.day_of_week,
  la.start_time,
  la.end_time,
  la.is_active,
  CASE WHEN la.property_id IS NULL THEN 'Global (All Properties)' ELSE 'Property-Specific' END as scope
FROM landlord_availability la
WHERE la.user_id = (
  SELECT user_id FROM properties WHERE id = '8152a9ad-bbe6-4d77-b392-e57fa273b965'
);

-- Step 3: Check what the service query would return
-- This mimics what viewingAppointmentService.getPropertyAvailability() does
SELECT 
  la.*,
  CASE 
    WHEN la.property_id = '8152a9ad-bbe6-4d77-b392-e57fa273b965' THEN 'Matches Property'
    WHEN la.property_id IS NULL THEN 'Global (Should Match)'
    ELSE 'Different Property'
  END as match_status
FROM landlord_availability la
WHERE la.user_id = (SELECT user_id FROM properties WHERE id = '8152a9ad-bbe6-4d77-b392-e57fa273b965')
  AND la.is_active = true
  AND (la.property_id = '8152a9ad-bbe6-4d77-b392-e57fa273b965' OR la.property_id IS NULL)
ORDER BY la.day_of_week, la.start_time;

-- Step 4: If no results above, add availability for THIS specific property's landlord
DO $$
DECLARE
  target_landlord_id uuid;
BEGIN
  -- Get the landlord ID for this property
  SELECT user_id INTO target_landlord_id
  FROM properties
  WHERE id = '8152a9ad-bbe6-4d77-b392-e57fa273b965';
  
  IF target_landlord_id IS NULL THEN
    RAISE NOTICE '❌ Property not found or has no landlord';
    RETURN;
  END IF;
  
  -- Check if landlord already has availability
  IF EXISTS (SELECT 1 FROM landlord_availability WHERE user_id = target_landlord_id) THEN
    RAISE NOTICE '✅ Landlord % already has availability', target_landlord_id;
  ELSE
    -- Add default availability
    INSERT INTO landlord_availability (user_id, property_id, day_of_week, start_time, end_time, is_active)
    VALUES 
      (target_landlord_id, NULL, 1, '09:00', '17:00', true),
      (target_landlord_id, NULL, 2, '09:00', '17:00', true),
      (target_landlord_id, NULL, 3, '09:00', '17:00', true),
      (target_landlord_id, NULL, 4, '09:00', '17:00', true),
      (target_landlord_id, NULL, 5, '09:00', '17:00', true),
      (target_landlord_id, NULL, 6, '10:00', '14:00', true);
    
    RAISE NOTICE '✅ Added 6 availability slots for landlord %', target_landlord_id;
  END IF;
END $$;

-- Step 5: Verify the fix
SELECT 
  'Property: ' || p.listing_title as info,
  'Landlord: ' || u.email as landlord,
  'Availability Slots: ' || COUNT(la.id) as slot_count
FROM properties p
JOIN auth.users u ON u.id = p.user_id
LEFT JOIN landlord_availability la ON la.user_id = p.user_id AND la.is_active = true
WHERE p.id = '8152a9ad-bbe6-4d77-b392-e57fa273b965'
GROUP BY p.listing_title, u.email;

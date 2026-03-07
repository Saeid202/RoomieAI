-- AUTOMATIC: Add viewing availability for ALL landlords with properties
-- This will automatically detect landlords and add default availability
-- No manual ID entry required!

-- Step 1: Add availability for all landlords who have properties
DO $$
DECLARE
  landlord_record RECORD;
  slots_added INTEGER := 0;
BEGIN
  -- Loop through all landlords who have active properties
  FOR landlord_record IN 
    SELECT DISTINCT p.user_id, u.email
    FROM properties p
    JOIN auth.users u ON u.id = p.user_id
    WHERE p.status != 'archived'
      AND p.user_id IS NOT NULL
  LOOP
    -- Check if this landlord already has availability
    IF NOT EXISTS (
      SELECT 1 FROM landlord_availability 
      WHERE user_id = landlord_record.user_id
    ) THEN
      -- Add default availability: Monday-Friday 9 AM - 5 PM, Saturday 10 AM - 2 PM
      INSERT INTO landlord_availability (user_id, property_id, day_of_week, start_time, end_time, is_active)
      VALUES 
        (landlord_record.user_id, NULL, 1, '09:00', '17:00', true),  -- Monday
        (landlord_record.user_id, NULL, 2, '09:00', '17:00', true),  -- Tuesday
        (landlord_record.user_id, NULL, 3, '09:00', '17:00', true),  -- Wednesday
        (landlord_record.user_id, NULL, 4, '09:00', '17:00', true),  -- Thursday
        (landlord_record.user_id, NULL, 5, '09:00', '17:00', true),  -- Friday
        (landlord_record.user_id, NULL, 6, '10:00', '14:00', true);  -- Saturday
      
      slots_added := slots_added + 6;
      RAISE NOTICE 'Added 6 availability slots for landlord: % (%)', landlord_record.email, landlord_record.user_id;
    ELSE
      RAISE NOTICE 'Landlord % already has availability, skipping', landlord_record.email;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ COMPLETE: Added % total availability slots', slots_added;
END $$;

-- Step 2: Verify what was added
SELECT 
  u.email as landlord_email,
  la.user_id as landlord_id,
  COUNT(*) as availability_slots,
  COUNT(*) FILTER (WHERE la.is_active = true) as active_slots,
  MIN(CASE la.day_of_week
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END) as first_day,
  MAX(CASE la.day_of_week
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END) as last_day
FROM landlord_availability la
JOIN auth.users u ON u.id = la.user_id
GROUP BY u.email, la.user_id
ORDER BY u.email;

-- Step 3: Show detailed availability schedule
SELECT 
  u.email as landlord_email,
  CASE la.day_of_week
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END as day_name,
  la.start_time,
  la.end_time,
  la.is_active,
  CASE WHEN la.property_id IS NULL THEN 'All Properties' ELSE 'Specific Property' END as scope
FROM landlord_availability la
JOIN auth.users u ON u.id = la.user_id
ORDER BY u.email, la.day_of_week, la.start_time;

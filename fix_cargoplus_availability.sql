-- Fix: Add GLOBAL availability for info@cargoplus.site landlord
-- This will make the calendar show up for ALL their properties

-- Step 1: Get the landlord's user_id
SELECT id, email FROM auth.users WHERE email = 'info@cargoplus.site';

-- Step 2: Add global availability (property_id = NULL) for this landlord
INSERT INTO landlord_availability (user_id, property_id, day_of_week, start_time, end_time, is_active)
SELECT 
  u.id,
  NULL,  -- Global (applies to all properties)
  day_num,
  CASE 
    WHEN day_num = 6 THEN '10:00'::time  -- Saturday: 10 AM
    ELSE '09:00'::time  -- Weekdays: 9 AM
  END,
  CASE 
    WHEN day_num = 6 THEN '14:00'::time  -- Saturday: 2 PM
    ELSE '17:00'::time  -- Weekdays: 5 PM
  END,
  true
FROM auth.users u
CROSS JOIN generate_series(1, 6) AS day_num  -- Monday (1) to Saturday (6)
WHERE u.email = 'info@cargoplus.site'
  AND NOT EXISTS (
    -- Don't duplicate if global availability already exists
    SELECT 1 FROM landlord_availability la
    WHERE la.user_id = u.id 
      AND la.property_id IS NULL
      AND la.day_of_week = day_num
  );

-- Step 3: Verify the fix
SELECT 
  u.email,
  la.day_of_week,
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
  CASE WHEN la.property_id IS NULL THEN '✅ Global (All Properties)' ELSE '⚠️ Property-Specific' END as scope
FROM landlord_availability la
JOIN auth.users u ON u.id = la.user_id
WHERE u.email = 'info@cargoplus.site'
  AND la.is_active = true
ORDER BY la.property_id NULLS FIRST, la.day_of_week, la.start_time;

-- Step 4: Count total slots
SELECT 
  'Total Slots: ' || COUNT(*) as summary,
  'Global Slots: ' || COUNT(*) FILTER (WHERE property_id IS NULL) as global_count,
  'Property-Specific: ' || COUNT(*) FILTER (WHERE property_id IS NOT NULL) as specific_count
FROM landlord_availability la
JOIN auth.users u ON u.id = la.user_id
WHERE u.email = 'info@cargoplus.site'
  AND la.is_active = true;

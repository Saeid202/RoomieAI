-- QUICK FIX: Add availability to see the Calendly calendar
-- Run this to add test viewing hours

-- Find the landlord user_id from the property in your screenshot
-- Look at the debug info: "Owner: xxxxxxxx..."

-- OPTION 1: If you know the landlord's email
SELECT id as user_id, email 
FROM auth.users 
WHERE email LIKE '%@%'  -- Replace with landlord's email
LIMIT 5;

-- OPTION 2: Find from recent properties
SELECT DISTINCT 
  p.user_id as landlord_user_id,
  u.email as landlord_email,
  COUNT(p.id) as property_count
FROM properties p
JOIN auth.users u ON u.id = p.user_id
WHERE p.status != 'archived'
GROUP BY p.user_id, u.email
ORDER BY property_count DESC
LIMIT 5;

-- ONCE YOU HAVE THE USER_ID, RUN THIS:
-- (Replace 'YOUR_LANDLORD_USER_ID_HERE' with actual ID)

DO $$
DECLARE
  landlord_id uuid := 'YOUR_LANDLORD_USER_ID_HERE'::uuid;
BEGIN
  -- Add Monday to Friday, 9 AM - 5 PM availability (Global)
  INSERT INTO landlord_availability (user_id, property_id, day_of_week, start_time, end_time, is_active)
  VALUES 
    (landlord_id, NULL, 1, '09:00', '17:00', true),
    (landlord_id, NULL, 2, '09:00', '17:00', true),
    (landlord_id, NULL, 3, '09:00', '17:00', true),
    (landlord_id, NULL, 4, '09:00', '17:00', true),
    (landlord_id, NULL, 5, '09:00', '17:00', true),
    (landlord_id, NULL, 6, '10:00', '14:00', true);  -- Saturday shorter hours
  
  RAISE NOTICE 'Added 6 availability slots for landlord %', landlord_id;
END $$;

-- Verify it worked
SELECT 
  day_of_week,
  start_time,
  end_time,
  CASE day_of_week
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END as day_name
FROM landlord_availability
WHERE user_id = 'YOUR_LANDLORD_USER_ID_HERE'::uuid
  AND is_active = true
ORDER BY day_of_week, start_time;

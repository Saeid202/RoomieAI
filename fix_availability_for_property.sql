-- AUTO-FIX: Add availability for the property showing in your modal
-- Based on the debug info: Prop: 2a79ffab..., Owner: f8e4c4e8...

-- Step 1: Find the exact property (to get full IDs)
SELECT 
  id,
  user_id,
  address,
  city,
  listing_title
FROM properties
WHERE id::text LIKE '2a79ffab%'
LIMIT 1;

-- Step 2: Check current availability
SELECT COUNT(*) as availability_count
FROM landlord_availability
WHERE user_id::text LIKE 'f8e4c4e8%';

-- Step 3: Add Monday-Friday 9 AM - 5 PM availability
-- This will work for the property shown in your modal
INSERT INTO landlord_availability (user_id, property_id, day_of_week, start_time, end_time, is_active)
SELECT 
  p.user_id,
  p.id,
  day_num,
  '09:00:00'::time,
  '17:00:00'::time,
  true
FROM properties p
CROSS JOIN (
  SELECT 1 as day_num UNION ALL  -- Monday
  SELECT 2 UNION ALL              -- Tuesday
  SELECT 3 UNION ALL              -- Wednesday
  SELECT 4 UNION ALL              -- Thursday
  SELECT 5                        -- Friday
) days
WHERE p.id::text LIKE '2a79ffab%'
ON CONFLICT DO NOTHING;

-- Step 4: Verify it was added
SELECT 
  id,
  property_id,
  day_of_week,
  start_time,
  end_time,
  is_active,
  CASE day_of_week
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
  END as day_name
FROM landlord_availability
WHERE property_id::text LIKE '2a79ffab%'
ORDER BY day_of_week;

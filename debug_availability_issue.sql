-- Debug script to check availability data
-- Run this to see what's actually saved in the database

-- 1. Check all availability records
SELECT 
  id,
  user_id,
  property_id,
  day_of_week,
  start_time,
  end_time,
  is_active,
  created_at
FROM landlord_availability
ORDER BY created_at DESC
LIMIT 20;

-- 2. Check availability for a specific property (replace with your property ID)
-- SELECT 
--   id,
--   user_id,
--   property_id,
--   day_of_week,
--   start_time,
--   end_time,
--   is_active
-- FROM landlord_availability
-- WHERE property_id = 'YOUR_PROPERTY_ID_HERE'
-- ORDER BY day_of_week, start_time;

-- 3. Check properties table to get property IDs and owners
SELECT 
  id,
  user_id,
  address,
  city,
  listing_title
FROM properties
WHERE status != 'archived'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if there are any availability records with NULL property_id (global availability)
SELECT 
  COUNT(*) as global_availability_count,
  user_id
FROM landlord_availability
WHERE property_id IS NULL
GROUP BY user_id;

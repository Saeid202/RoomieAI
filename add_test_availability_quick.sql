-- Quick script to add test availability for a property
-- This helps verify the fix is working

-- ============================================
-- STEP 1: Find your property and user IDs
-- ============================================
-- Replace 'YOUR_ADDRESS' with part of your property address
SELECT 
  id as property_id,
  user_id as landlord_id,
  address,
  listing_title
FROM properties
WHERE address ILIKE '%YOUR_ADDRESS%'
  OR listing_title ILIKE '%YOUR_ADDRESS%'
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- STEP 2: Delete existing availability (optional)
-- ============================================
-- Uncomment and replace IDs if you want to start fresh
-- DELETE FROM landlord_availability 
-- WHERE property_id = 'YOUR_PROPERTY_ID';

-- ============================================
-- STEP 3: Add test availability
-- ============================================
-- Replace YOUR_USER_ID and YOUR_PROPERTY_ID with values from STEP 1
-- This adds Monday-Friday, 9 AM - 5 PM availability

INSERT INTO landlord_availability (
  user_id, 
  property_id, 
  day_of_week, 
  start_time, 
  end_time, 
  is_active
)
VALUES 
  -- Monday
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 1, '09:00:00', '17:00:00', true),
  -- Tuesday
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 2, '09:00:00', '17:00:00', true),
  -- Wednesday
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 3, '09:00:00', '17:00:00', true),
  -- Thursday
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 4, '09:00:00', '17:00:00', true),
  -- Friday
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 5, '09:00:00', '17:00:00', true);

-- ============================================
-- STEP 4: Verify it was added
-- ============================================
-- Replace YOUR_USER_ID and YOUR_PROPERTY_ID
SELECT 
  id,
  day_of_week,
  start_time,
  end_time,
  is_active,
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
WHERE user_id = 'YOUR_USER_ID'
  AND property_id = 'YOUR_PROPERTY_ID'
ORDER BY day_of_week, start_time;

-- ============================================
-- Alternative: Add GLOBAL availability (all properties)
-- ============================================
-- This makes availability apply to ALL your properties
-- Uncomment and replace YOUR_USER_ID to use:

-- INSERT INTO landlord_availability (
--   user_id, 
--   property_id,  -- NULL = applies to all properties
--   day_of_week, 
--   start_time, 
--   end_time, 
--   is_active
-- )
-- VALUES 
--   ('YOUR_USER_ID', NULL, 1, '09:00:00', '17:00:00', true),
--   ('YOUR_USER_ID', NULL, 2, '09:00:00', '17:00:00', true),
--   ('YOUR_USER_ID', NULL, 3, '09:00:00', '17:00:00', true),
--   ('YOUR_USER_ID', NULL, 4, '09:00:00', '17:00:00', true),
--   ('YOUR_USER_ID', NULL, 5, '09:00:00', '17:00:00', true);

-- ============================================
-- Day of Week Reference
-- ============================================
-- 0 = Sunday
-- 1 = Monday
-- 2 = Tuesday
-- 3 = Wednesday
-- 4 = Thursday
-- 5 = Friday
-- 6 = Saturday

-- ============================================
-- Time Format
-- ============================================
-- Use 24-hour format: HH:MM:SS
-- Examples:
--   09:00:00 = 9:00 AM
--   12:00:00 = 12:00 PM (noon)
--   17:00:00 = 5:00 PM
--   23:59:00 = 11:59 PM

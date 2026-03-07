-- COMPREHENSIVE AVAILABILITY DIAGNOSTIC
-- This script helps you verify why availability isn't showing up

-- ============================================
-- STEP 1: Find your property
-- ============================================
-- Replace 'YOUR_ADDRESS_HERE' with part of your property address
SELECT 
  id as property_id,
  user_id as landlord_id,
  address,
  city,
  listing_title,
  status
FROM properties
WHERE address ILIKE '%YOUR_ADDRESS_HERE%'
  OR listing_title ILIKE '%YOUR_ADDRESS_HERE%'
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- STEP 2: Check availability for YOUR specific property
-- ============================================
-- Copy the property_id and user_id from STEP 1 above
-- Replace the values below:

SELECT 
  id,
  user_id,
  property_id,
  day_of_week,
  start_time,
  end_time,
  is_active,
  created_at,
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
WHERE user_id = 'YOUR_LANDLORD_ID_HERE'  -- Replace with user_id from STEP 1
  AND (
    property_id = 'YOUR_PROPERTY_ID_HERE'  -- Replace with property_id from STEP 1
    OR property_id IS NULL  -- Global availability
  )
ORDER BY day_of_week, start_time;

-- ============================================
-- STEP 3: Check ALL availability for this landlord
-- ============================================
-- This shows all availability slots for the landlord (any property)
SELECT 
  id,
  property_id,
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
  END as day_name,
  CASE 
    WHEN property_id IS NULL THEN 'GLOBAL (all properties)'
    ELSE 'Property-specific'
  END as scope
FROM landlord_availability
WHERE user_id = 'YOUR_LANDLORD_ID_HERE'  -- Replace with user_id from STEP 1
ORDER BY 
  CASE WHEN property_id IS NULL THEN 0 ELSE 1 END,
  day_of_week, 
  start_time;

-- ============================================
-- STEP 4: Verify the query that the app uses
-- ============================================
-- This simulates exactly what the app does
-- Replace the values:
SELECT 
  id,
  user_id,
  property_id,
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
WHERE is_active = true
  AND user_id = 'YOUR_LANDLORD_ID_HERE'  -- Replace with user_id from STEP 1
  AND (
    property_id = 'YOUR_PROPERTY_ID_HERE'  -- Replace with property_id from STEP 1
    OR property_id IS NULL
  )
ORDER BY day_of_week, start_time;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- If STEP 4 returns rows: Availability exists! Check browser console for errors
-- If STEP 4 returns 0 rows: Availability not saved properly
--   - Check if is_active = false
--   - Check if user_id doesn't match
--   - Check if property_id doesn't match and isn't NULL

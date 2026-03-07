-- IMMEDIATE DIAGNOSTIC FOR YOUR PROPERTY
-- Run this in Supabase SQL Editor to see what's happening

-- Step 1: Get the property you're viewing
-- Look at the URL in your browser - it should have a property ID
-- Example: localhost:5173/dashboard/rent/2a79ffab-ce23-40f1-b9d7-fd819a1716c6
-- The long string after /rent/ is your property_id

-- Replace 'YOUR_PROPERTY_ID' with the ID from your URL
SELECT 
  id,
  user_id as landlord_id,
  address,
  city,
  listing_title,
  status
FROM properties
WHERE id = 'YOUR_PROPERTY_ID';  -- Replace this!

-- Step 2: Check if availability exists for this property
-- Copy the landlord_id from Step 1 and replace below
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
  END as day_name,
  CASE 
    WHEN property_id IS NULL THEN '🌍 GLOBAL (all properties)'
    ELSE '🏠 Property-specific'
  END as scope
FROM landlord_availability
WHERE user_id = 'YOUR_LANDLORD_ID'  -- Replace with landlord_id from Step 1
  AND (
    property_id = 'YOUR_PROPERTY_ID'  -- Replace with property_id from Step 1
    OR property_id IS NULL
  )
ORDER BY day_of_week, start_time;

-- Step 3: If Step 2 returns 0 rows, check ALL availability for this landlord
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
  END as day_name
FROM landlord_availability
WHERE user_id = 'YOUR_LANDLORD_ID'  -- Replace with landlord_id from Step 1
ORDER BY day_of_week, start_time;

-- QUICK FIX: If no availability exists, add some test data
-- Uncomment and replace IDs to add Monday-Friday 9 AM - 5 PM availability:

/*
INSERT INTO landlord_availability (user_id, property_id, day_of_week, start_time, end_time, is_active)
VALUES 
  ('YOUR_LANDLORD_ID', 'YOUR_PROPERTY_ID', 1, '09:00:00', '17:00:00', true),
  ('YOUR_LANDLORD_ID', 'YOUR_PROPERTY_ID', 2, '09:00:00', '17:00:00', true),
  ('YOUR_LANDLORD_ID', 'YOUR_PROPERTY_ID', 3, '09:00:00', '17:00:00', true),
  ('YOUR_LANDLORD_ID', 'YOUR_PROPERTY_ID', 4, '09:00:00', '17:00:00', true),
  ('YOUR_LANDLORD_ID', 'YOUR_PROPERTY_ID', 5, '09:00:00', '17:00:00', true);
*/

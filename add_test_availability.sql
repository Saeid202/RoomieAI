-- Add Test Availability to See Calendly Picker
-- This will add viewing availability for the property you're looking at

-- First, let's find the property from the screenshot
-- The property ID should be visible in the URL or debug info

-- STEP 1: Find your property and landlord
SELECT 
  id as property_id,
  user_id as landlord_id,
  listing_title,
  address,
  city
FROM properties
WHERE status != 'archived'
ORDER BY created_at DESC
LIMIT 5;

-- STEP 2: After you identify the property, add availability
-- Replace [LANDLORD_USER_ID] with the actual user_id from above
-- Replace [PROPERTY_ID] with the property id (or use NULL for global)

-- Add Monday through Friday, 9 AM to 5 PM (Global - all properties)
INSERT INTO landlord_availability (user_id, property_id, day_of_week, start_time, end_time, is_active)
VALUES 
  ('[LANDLORD_USER_ID]', NULL, 1, '09:00', '17:00', true),  -- Monday
  ('[LANDLORD_USER_ID]', NULL, 2, '09:00', '17:00', true),  -- Tuesday
  ('[LANDLORD_USER_ID]', NULL, 3, '09:00', '17:00', true),  -- Wednesday
  ('[LANDLORD_USER_ID]', NULL, 4, '09:00', '17:00', true),  -- Thursday
  ('[LANDLORD_USER_ID]', NULL, 5, '09:00', '17:00', true);  -- Friday

-- OR add for specific property only
-- INSERT INTO landlord_availability (user_id, property_id, day_of_week, start_time, end_time, is_active)
-- VALUES 
--   ('[LANDLORD_USER_ID]', '[PROPERTY_ID]', 1, '09:00', '17:00', true),
--   ('[LANDLORD_USER_ID]', '[PROPERTY_ID]', 2, '09:00', '17:00', true),
--   ('[LANDLORD_USER_ID]', '[PROPERTY_ID]', 3, '09:00', '17:00', true),
--   ('[LANDLORD_USER_ID]', '[PROPERTY_ID]', 4, '09:00', '17:00', true),
--   ('[LANDLORD_USER_ID]', '[PROPERTY_ID]', 5, '09:00', '17:00', true);

-- STEP 3: Verify the availability was added
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
WHERE user_id = '[LANDLORD_USER_ID]'
ORDER BY day_of_week, start_time;

-- STEP 4: After running this, refresh the Schedule Viewing modal
-- Click the "Refresh" button in the blue debug section
-- You should now see the Calendly-style calendar with time slots!

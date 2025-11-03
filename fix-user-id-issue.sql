-- Fix the user_id issue in the properties table
-- This script addresses the null user_id constraint violation

-- First, let's check if there are any existing properties with null user_id
SELECT id, listing_title, user_id FROM properties WHERE user_id IS NULL;

-- If there are any null user_id records, we need to either delete them or update them
-- Option 1: Delete properties with null user_id (if they are test data)
DELETE FROM properties WHERE user_id IS NULL;

-- Option 2: If you want to keep the data, you could update with a specific user_id
-- (Replace 'your-user-id-here' with an actual user ID from auth.users)
-- UPDATE properties SET user_id = 'your-user-id-here' WHERE user_id IS NULL;

-- Now let's create a safer test data insertion that doesn't rely on auth.uid()
-- First, let's get a valid user_id from the auth.users table
SELECT id, email FROM auth.users LIMIT 1;

-- If you want to insert test data, use a specific user_id instead of auth.uid()
-- Replace 'your-actual-user-id' with a real user ID from the query above
/*
INSERT INTO properties (
  user_id,
  listing_title,
  property_type,
  description,
  address,
  city,
  state,
  zip_code,
  monthly_rent,
  security_deposit,
  lease_terms,
  available_date,
  furnished,
  bedrooms,
  bathrooms,
  amenities,
  parking,
  pet_policy,
  utilities_included
) VALUES (
  'your-actual-user-id', -- Replace with actual user ID
  'Test Property - 2BR Apartment',
  'Apartment',
  'Beautiful 2-bedroom apartment in downtown area',
  '123 Test Street',
  'Toronto',
  'Ontario',
  'M5V 3A8',
  2500.00,
  2500.00,
  '1 year',
  '2024-12-01',
  false,
  2,
  1.5,
  ARRAY['Air Conditioning', 'Laundry', 'WiFi', 'Parking'],
  'Underground Garage',
  'Pets Allowed',
  ARRAY['Water', 'Heat', 'Internet']
);
*/

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position;

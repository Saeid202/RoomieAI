-- Fix: Reassign orphaned properties to an existing landlord account
-- Option 1: Assign to chinaplusgroup@gmail.com (most recent landlord)
UPDATE properties
SET user_id = '8b36ab9f-1c63-4ce5-89fa-5af04ae9c161'
WHERE user_id = '05979fd9-3da8-45b4-8999-aa784f046bf4';

-- Verify the update
SELECT 
  id,
  listing_title,
  user_id,
  city,
  monthly_rent,
  status
FROM properties
WHERE user_id = '8b36ab9f-1c63-4ce5-89fa-5af04ae9c161'
ORDER BY created_at DESC;

-- If you want to assign to leanne@homeandharmony.com instead, use this:
-- UPDATE properties
-- SET user_id = 'f2e0e405-4fd9-4ec0-b5e1-ec52793ff1f4'
-- WHERE user_id = '05979fd9-3da8-45b4-8999-aa784f046bf4';

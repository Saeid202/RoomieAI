-- Test script to manually insert a document access request
-- This will help verify if the table and RLS policies are working

-- First, find a sales property and a user
SELECT 
  'Property Info:' as info,
  p.id as property_id,
  p.listing_title,
  p.user_id as owner_id
FROM properties p
WHERE p.listing_category = 'sale'
LIMIT 1;

-- Get current user (you'll need to replace this with actual user ID)
SELECT 
  'Current User:' as info,
  auth.uid() as current_user_id;

-- Try to insert a test request (replace the UUIDs with actual values from above)
-- INSERT INTO document_access_requests (
--   property_id,
--   requester_id,
--   requester_name,
--   requester_email,
--   request_message,
--   status
-- ) VALUES (
--   'YOUR_PROPERTY_ID_HERE',
--   'YOUR_USER_ID_HERE',
--   'Test User',
--   'test@example.com',
--   'This is a test request',
--   'pending'
-- );

-- Check if the insert worked
SELECT 
  dar.*,
  p.listing_title,
  p.address
FROM document_access_requests dar
JOIN properties p ON dar.property_id = p.id
ORDER BY dar.requested_at DESC
LIMIT 5;

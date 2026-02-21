-- Check current state and optionally create a test request

-- 1. Check if any requests exist
SELECT 
  'Total Requests:' as info,
  COUNT(*) as count
FROM document_access_requests;

-- 2. Show your sales property
SELECT 
  'Your Sales Property:' as info,
  id,
  listing_title,
  address,
  user_id as owner_id
FROM properties
WHERE id = '3b80948d-74ca-494c-9c4b-9e012fb00add';

-- 3. Get your user ID
SELECT 
  'Your User ID:' as info,
  auth.uid() as user_id;

-- 4. Check if you have any other users in the system (potential buyers)
SELECT 
  'Other Users:' as info,
  id,
  email
FROM auth.users
WHERE id != auth.uid()
LIMIT 5;

-- ============================================
-- TO CREATE A TEST REQUEST:
-- ============================================
-- You need to:
-- 1. Log in as a DIFFERENT user (not the property owner)
-- 2. Go to the property details page
-- 3. Click "Request Full Document Access"
--
-- OR manually insert a test request:
-- (Replace 'BUYER_USER_ID' with an actual user ID from step 4 above)
--
-- INSERT INTO document_access_requests (
--   property_id,
--   requester_id,
--   requester_name,
--   requester_email,
--   request_message,
--   status
-- ) VALUES (
--   '3b80948d-74ca-494c-9c4b-9e012fb00add',
--   'BUYER_USER_ID_HERE',
--   'Test Buyer',
--   'buyer@example.com',
--   'I am interested in this property',
--   'pending'
-- );

-- 5. After creating, verify it appears
SELECT 
  'All Requests:' as info,
  dar.id,
  dar.requester_name,
  dar.requester_email,
  dar.status,
  dar.requested_at,
  p.listing_title
FROM document_access_requests dar
JOIN properties p ON dar.property_id = p.id
ORDER BY dar.requested_at DESC;

-- Verify buyer's approved access request
-- Buyer: saeid.shabani64@gmail.com (d599e69e-407f-44f4-899d-14a1e3af1103)
-- Property: 3b80948d-74ca-494c-9c4b-9e012fb00add

-- 1. Check if the request exists
SELECT 
  id,
  property_id,
  requester_id,
  requester_email,
  status,
  requested_at,
  reviewed_at,
  reviewed_by,
  response_message
FROM document_access_requests
WHERE property_id = '3b80948d-74ca-494c-9c4b-9e012fb00add'
  AND requester_id = 'd599e69e-407f-44f4-899d-14a1e3af1103';

-- 2. Check RLS policies on the table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'document_access_requests';

-- 3. Test the query that the frontend is using (as the buyer)
-- This simulates what happens when the buyer queries
SET LOCAL role authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "d599e69e-407f-44f4-899d-14a1e3af1103"}';

SELECT *
FROM document_access_requests
WHERE property_id = '3b80948d-74ca-494c-9c4b-9e012fb00add'
  AND requester_id = 'd599e69e-407f-44f4-899d-14a1e3af1103';

RESET role;

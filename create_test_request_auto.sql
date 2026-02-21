-- Automatically create a test document access request
-- This uses your current user ID as the requester

-- Insert a test request using the currently logged-in user
INSERT INTO document_access_requests (
  property_id,
  requester_id,
  requester_name,
  requester_email,
  request_message,
  status
)
SELECT
  '3b80948d-74ca-494c-9c4b-9e012fb00add'::uuid as property_id,
  auth.uid() as requester_id,
  COALESCE(up.full_name, 'Test Buyer') as requester_name,
  COALESCE(up.email, au.email, 'test@example.com') as requester_email,
  'This is a test request to verify the document access system is working' as request_message,
  'pending' as status
FROM auth.users au
LEFT JOIN user_profiles up ON up.id = au.id
WHERE au.id = auth.uid()
LIMIT 1;

-- Verify the request was created
SELECT 
  'Request Created Successfully!' as status,
  dar.id,
  dar.requester_name,
  dar.requester_email,
  dar.status,
  dar.requested_at,
  p.listing_title,
  p.address
FROM document_access_requests dar
JOIN properties p ON dar.property_id = p.id
WHERE dar.property_id = '3b80948d-74ca-494c-9c4b-9e012fb00add'
ORDER BY dar.requested_at DESC
LIMIT 1;

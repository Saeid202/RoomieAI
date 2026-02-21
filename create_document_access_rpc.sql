-- Create RPC function to get document access status
-- This bypasses TypeScript type issues

CREATE OR REPLACE FUNCTION get_document_access_status(
  p_property_id UUID,
  p_requester_id UUID
)
RETURNS TABLE (
  id UUID,
  property_id UUID,
  requester_id UUID,
  requester_name TEXT,
  requester_email TEXT,
  request_message TEXT,
  status TEXT,
  requested_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  response_message TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dar.id,
    dar.property_id,
    dar.requester_id,
    dar.requester_name,
    dar.requester_email,
    dar.request_message,
    dar.status,
    dar.requested_at,
    dar.reviewed_at,
    dar.reviewed_by,
    dar.response_message,
    dar.created_at,
    dar.updated_at
  FROM document_access_requests dar
  WHERE dar.property_id = p_property_id
    AND dar.requester_id = p_requester_id
  ORDER BY dar.requested_at DESC
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_document_access_status(UUID, UUID) TO authenticated;

-- Test the function
SELECT * FROM get_document_access_status(
  '3b80948d-74ca-494c-9c4b-9e012fb00add'::UUID,
  'd599e69e-407f-44f4-899d-14a1e3af1103'::UUID
);

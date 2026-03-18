-- Rate limiting for document processing (OCR/Gemini)
-- Limits: 5 documents per user per hour

CREATE TABLE IF NOT EXISTS document_processing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL,
  property_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  UNIQUE(user_id, document_id)
);

-- Index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_doc_requests_user_time 
ON document_processing_requests(user_id, created_at DESC);

-- Function to check and record rate limit
CREATE OR REPLACE FUNCTION check_document_rate_limit(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_count INTEGER;
  v_allowed BOOLEAN := true;
BEGIN
  -- Count requests in the last hour
  SELECT COUNT(*) INTO v_count
  FROM document_processing_requests
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';

  IF v_count >= 5 THEN
    v_allowed := false;
  END IF;

  RETURN json_build_object('allowed', v_allowed, 'count', v_count, 'limit', 5);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a document processing request
CREATE OR REPLACE FUNCTION record_document_request(
  p_user_id UUID,
  p_document_id UUID,
  p_property_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_request_id UUID;
BEGIN
  INSERT INTO document_processing_requests (user_id, document_id, property_id, ip_address)
  VALUES (p_user_id, p_document_id, p_property_id, p_ip_address)
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION check_document_rate_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION record_document_request(UUID, UUID, UUID, TEXT) TO authenticated;
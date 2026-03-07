-- =====================================================
-- Add Time-Limited Access to Document Access Requests
-- =====================================================
-- Purpose: Allow landlords to grant temporary access
--          to property documents with expiration dates
-- =====================================================

-- Add access_expires_at column
ALTER TABLE document_access_requests
ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMPTZ;

-- Add response_message column if it doesn't exist
ALTER TABLE document_access_requests
ADD COLUMN IF NOT EXISTS response_message TEXT;

-- Add index for efficient expiration checks
CREATE INDEX IF NOT EXISTS idx_document_access_requests_expires 
ON document_access_requests(access_expires_at) 
WHERE status = 'approved' AND access_expires_at IS NOT NULL;

-- Update RLS policy for buyers to check expiration
DROP POLICY IF EXISTS "Approved requesters can view documents" ON property_documents;
CREATE POLICY "Approved requesters can view documents"
  ON property_documents FOR SELECT
  USING (
    is_public = true
    OR
    EXISTS (
      SELECT 1 FROM document_access_requests
      WHERE document_access_requests.property_id = property_documents.property_id
        AND document_access_requests.requester_id = auth.uid()
        AND document_access_requests.status = 'approved'
        AND (
          document_access_requests.access_expires_at IS NULL 
          OR document_access_requests.access_expires_at > NOW()
        )
    )
  );

-- Create function to auto-expire old access grants
CREATE OR REPLACE FUNCTION expire_document_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE document_access_requests
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'approved'
    AND access_expires_at IS NOT NULL
    AND access_expires_at < NOW();
END;
$$;

-- Create a scheduled job to run expiration check (optional - can also check on access)
-- Note: This requires pg_cron extension which may not be available in all Supabase plans
-- Comment out if not available
-- SELECT cron.schedule(
--   'expire-document-access',
--   '0 * * * *', -- Every hour
--   'SELECT expire_document_access();'
-- );

COMMENT ON COLUMN document_access_requests.access_expires_at IS 'When the approved access expires. NULL means permanent access.';
COMMENT ON FUNCTION expire_document_access() IS 'Automatically expires document access grants that have passed their expiration date';

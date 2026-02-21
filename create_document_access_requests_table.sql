-- Create document_access_requests table for property document access
CREATE TABLE IF NOT EXISTS document_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_name TEXT,
  requester_email TEXT,
  request_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_access_requests_property ON document_access_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_document_access_requests_requester ON document_access_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_document_access_requests_status ON document_access_requests(status);

-- Enable RLS
ALTER TABLE document_access_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own requests"
  ON document_access_requests FOR SELECT
  USING (auth.uid() = requester_id);

CREATE POLICY "Property owners can view requests for their properties"
  ON document_access_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = document_access_requests.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create requests"
  ON document_access_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Property owners can update requests for their properties"
  ON document_access_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = document_access_requests.property_id
        AND properties.user_id = auth.uid()
    )
  );

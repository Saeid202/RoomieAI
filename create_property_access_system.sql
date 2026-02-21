-- Create property-level document access table
CREATE TABLE IF NOT EXISTS property_document_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  request_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id),
  response_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(property_id, requester_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_property_document_access_property ON property_document_access(property_id);
CREATE INDEX IF NOT EXISTS idx_property_document_access_requester ON property_document_access(requester_id);
CREATE INDEX IF NOT EXISTS idx_property_document_access_status ON property_document_access(status);

-- Enable RLS
ALTER TABLE property_document_access ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view their own access requests"
ON property_document_access
FOR SELECT
TO authenticated
USING (requester_id = auth.uid());

-- Policy: Property owners can view requests for their properties
CREATE POLICY "Property owners can view access requests"
ON property_document_access
FOR SELECT
TO authenticated
USING (
  property_id IN (
    SELECT id FROM properties WHERE user_id = auth.uid()
  )
);

-- Policy: Users can create access requests
CREATE POLICY "Users can create access requests"
ON property_document_access
FOR INSERT
TO authenticated
WITH CHECK (requester_id = auth.uid());

-- Policy: Property owners can update requests for their properties
CREATE POLICY "Property owners can update access requests"
ON property_document_access
FOR UPDATE
TO authenticated
USING (
  property_id IN (
    SELECT id FROM properties WHERE user_id = auth.uid()
  )
);

-- Verify table was created
SELECT * FROM property_document_access LIMIT 1;

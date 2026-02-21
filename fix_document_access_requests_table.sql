-- Fix document_access_requests table
-- The existing table has wrong structure (has document_id column)
-- We need property-level access, not document-level

-- 1. Check current structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'document_access_requests'
ORDER BY ordinal_position;

-- 2. Drop the old table (if it exists)
DROP TABLE IF EXISTS document_access_requests CASCADE;

-- 3. Create the correct table structure (property-level access)
CREATE TABLE document_access_requests (
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
  response_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create indexes
CREATE INDEX idx_document_access_requests_property ON document_access_requests(property_id);
CREATE INDEX idx_document_access_requests_requester ON document_access_requests(requester_id);
CREATE INDEX idx_document_access_requests_status ON document_access_requests(status);

-- 5. Enable RLS
ALTER TABLE document_access_requests ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
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

-- 7. Verify the new structure
SELECT 
  'Table recreated successfully!' as status,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'document_access_requests'
ORDER BY ordinal_position;

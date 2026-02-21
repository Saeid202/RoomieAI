-- Fix RLS policies to allow buyers with approved access to view property documents

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users with approved access can view documents" ON property_documents;
DROP POLICY IF EXISTS "Buyers with approved access can view documents" ON property_documents;

-- Create policy for buyers with approved document access requests
CREATE POLICY "Buyers with approved access can view documents"
  ON property_documents FOR SELECT
  USING (
    -- Allow if user has an approved access request for this property
    EXISTS (
      SELECT 1 
      FROM document_access_requests
      WHERE document_access_requests.property_id = property_documents.property_id
        AND document_access_requests.requester_id = auth.uid()
        AND document_access_requests.status = 'approved'
    )
  );

-- Verify the policy was created
SELECT 
  'Policy Created:' as status,
  policyname,
  cmd,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'property_documents'
  AND policyname = 'Buyers with approved access can view documents';

-- Test: Check if buyer can now see documents (as admin, we can see the logic)
SELECT 
  'Test Query:' as test_type,
  pd.id,
  pd.document_label,
  pd.file_name,
  dar.status as access_status,
  dar.requester_email
FROM property_documents pd
LEFT JOIN document_access_requests dar 
  ON dar.property_id = pd.property_id
  AND dar.requester_id = 'd599e69e-407f-44f4-899d-14a1e3af1103'
WHERE pd.property_id = '3b80948d-74ca-494c-9c4b-9e012fb00add'
  AND pd.deleted_at IS NULL
  AND dar.status = 'approved';

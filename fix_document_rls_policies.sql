-- Check current RLS policies on property_documents table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'property_documents';

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can view their own property documents" ON property_documents;
DROP POLICY IF EXISTS "Only owners can view documents" ON property_documents;

-- Create new policy: Allow everyone to view all property documents
-- (Buyers need to see documents exist so they can request access)
CREATE POLICY "Anyone can view property documents"
ON property_documents
FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can insert documents for their own properties
CREATE POLICY "Users can upload documents to their properties"
ON property_documents
FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid()
);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update their own documents"
ON property_documents
FOR UPDATE
TO authenticated
USING (uploaded_by = auth.uid())
WITH CHECK (uploaded_by = auth.uid());

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
ON property_documents
FOR DELETE
TO authenticated
USING (uploaded_by = auth.uid());

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'property_documents';

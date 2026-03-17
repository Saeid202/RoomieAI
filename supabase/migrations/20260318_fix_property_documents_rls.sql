-- Fix RLS policies on property_documents table
-- Issue: Policies were checking for properties.landlord_id but properties table uses user_id

-- Drop existing broken policies
DROP POLICY IF EXISTS "Landlords can view own property documents" ON property_documents;
DROP POLICY IF EXISTS "Landlords can insert own property documents" ON property_documents;
DROP POLICY IF EXISTS "Landlords can update own property documents" ON property_documents;
DROP POLICY IF EXISTS "Landlords can delete own property documents" ON property_documents;

-- Create corrected policies using user_id (correct column name)
CREATE POLICY "Landlords can view own property documents"
ON property_documents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_documents.property_id 
        AND properties.user_id = auth.uid()
    )
);

CREATE POLICY "Landlords can insert own property documents"
ON property_documents FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_documents.property_id 
        AND properties.user_id = auth.uid()
    )
);

CREATE POLICY "Landlords can update own property documents"
ON property_documents FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_documents.property_id 
        AND properties.user_id = auth.uid()
    )
);

CREATE POLICY "Landlords can delete own property documents"
ON property_documents FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_documents.property_id 
        AND properties.user_id = auth.uid()
    )
);

-- Verify the policies were created
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'property_documents';
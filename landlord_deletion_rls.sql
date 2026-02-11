-- RLS policy for landlords to delete properties
-- Specifically for users with landlord role

-- First, ensure RLS is enabled
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_listings ENABLE ROW LEVEL SECURITY;

-- Drop any existing landlord-specific policies
DROP POLICY IF EXISTS "Landlords can delete own properties" ON properties;
DROP POLICY IF EXISTS "Landlords can delete own sales_listings" ON sales_listings;

-- Create policy for landlords only (check assignedRole in metadata)
CREATE POLICY "Landlords can delete own properties" ON properties
FOR DELETE
USING (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND raw_user_meta_data->>'assignedRole' = 'landlord'
    )
);

-- Create policy for landlords only on sales_listings
CREATE POLICY "Landlords can delete own sales_listings" ON sales_listings
FOR DELETE
USING (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND raw_user_meta_data->>'assignedRole' = 'landlord'
    )
);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('properties', 'sales_listings') 
AND policyname LIKE '%Landlord%'
ORDER BY policyname;

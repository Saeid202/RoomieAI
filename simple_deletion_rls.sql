-- Simple RLS policy for property deletion
-- Allow landlords to delete their own properties

-- Drop existing policies that might block deletion
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own sales_listings" ON sales_listings;

-- Create simple policy: Users can delete their own properties
CREATE POLICY "Landlords can delete own properties" ON properties
FOR DELETE
USING (
    auth.uid() = user_id
);

-- Create simple policy: Users can delete their own sales listings  
CREATE POLICY "Landlords can delete own sales_listings" ON sales_listings
FOR DELETE
USING (
    auth.uid() = user_id
);

-- Verify policies were created
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
AND policyname LIKE '%delete%'
ORDER BY policyname;

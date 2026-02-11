-- Check and fix RLS policies for property deletion
-- This will ensure landlords can delete their own properties

-- Check current RLS policies on properties table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'properties' 
ORDER BY policyname;

-- Check current RLS policies on sales_listings table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'sales_listings' 
ORDER BY policyname;

-- Drop existing policies that might block deletion
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own sales_listings" ON sales_listings;

-- Create proper RLS policies for property deletion
-- Allow users to delete their own properties
CREATE POLICY "Users can delete own properties" ON properties
FOR DELETE
USING (
    auth.uid() = user_id
);

-- Allow users to delete their own sales listings
CREATE POLICY "Users can delete own sales_listings" ON sales_listings
FOR DELETE
USING (
    auth.uid() = user_id
);

-- Enable RLS on both tables (should already be enabled)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_listings ENABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('properties', 'sales_listings') 
AND policyname LIKE '%delete%'
ORDER BY policyname;

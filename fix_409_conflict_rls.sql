-- Fix 409 Conflict Error - RLS Policies for Property Deletion
-- This will resolve the authentication and permission issues

-- Step 1: Drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own sales_listings" ON sales_listings;
DROP POLICY IF EXISTS "Landlords can delete own properties" ON properties;
DROP POLICY IF EXISTS "Landlords can delete own sales_listings" ON sales_listings;

-- Step 2: Ensure RLS is enabled
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_listings ENABLE ROW LEVEL SECURITY;

-- Step 3: Create simple, effective policies for property deletion
CREATE POLICY "Users can delete own properties" ON properties
FOR DELETE
USING (
    auth.uid() = user_id
);

CREATE POLICY "Users can delete own sales_listings" ON sales_listings
FOR DELETE
USING (
    auth.uid() = user_id
);

-- Step 4: Verify policies were created correctly
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
AND cmd = 'DELETE'
ORDER BY tablename, policyname;

-- Step 5: Test the policies (this will show if they work)
SELECT 
    'Policy Test Results' as test_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'properties' 
            AND cmd = 'DELETE'
            AND policyname = 'Users can delete own properties'
        ) THEN '✅ Properties delete policy created'
        ELSE '❌ Properties delete policy missing'
    END as properties_policy,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'sales_listings' 
            AND cmd = 'DELETE'
            AND policyname = 'Users can delete own sales_listings'
        ) THEN '✅ Sales listings delete policy created'
        ELSE '❌ Sales listings delete policy missing'
    END as sales_policy;

-- Step 6: Check for foreign key constraints that might block deletion
SELECT 
    'Foreign Key Constraints' as constraint_type,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    CASE 
        WHEN tc.table_name IN ('properties', 'sales_listings') THEN '⚠️ May block deletion'
        ELSE '✅ Not blocking'
    END as impact
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name IN ('properties', 'sales_listings') OR ccu.table_name IN ('properties', 'sales_listings'))
ORDER BY tc.table_name;

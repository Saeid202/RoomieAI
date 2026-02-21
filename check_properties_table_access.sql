-- Check properties table structure and RLS policies

-- 1. Check if properties table exists
SELECT 'TABLE EXISTS:' as check_type;
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'properties';

-- 2. Check RLS is enabled
SELECT 'RLS STATUS:' as check_type;
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'properties';

-- 3. Check INSERT policies for properties
SELECT 'INSERT POLICIES:' as check_type;
SELECT 
    policyname,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'properties'
  AND cmd = 'INSERT';

-- 4. Check all policies for properties
SELECT 'ALL POLICIES:' as check_type;
SELECT 
    policyname,
    cmd as operation,
    roles,
    CASE 
        WHEN permissive = 'PERMISSIVE' THEN 'Allow'
        ELSE 'Restrict'
    END as type
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'properties'
ORDER BY cmd, policyname;

-- 5. Check required columns exist
SELECT 'REQUIRED COLUMNS:' as check_type;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'properties'
  AND column_name IN (
    'id', 'landlord_id', 'title', 'address', 
    'listing_category', 'property_category', 'status'
  )
ORDER BY ordinal_position;

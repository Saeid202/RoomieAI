-- Check if tenant_profiles table already exists and show its structure

-- 1. Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_profiles')
        THEN '✓ tenant_profiles table EXISTS'
        ELSE '✗ tenant_profiles table DOES NOT EXIST'
    END as table_status;

-- 2. If it exists, show all columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tenant_profiles'
ORDER BY ordinal_position;

-- 3. Count records
SELECT COUNT(*) as record_count FROM tenant_profiles;

-- 4. Show sample data (if any)
SELECT * FROM tenant_profiles LIMIT 5;

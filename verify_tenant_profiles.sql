-- Verification script for tenant_profiles table creation

-- 1. Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_profiles')
        THEN '✓ tenant_profiles table exists'
        ELSE '✗ tenant_profiles table NOT FOUND'
    END as table_status;

-- 2. Show all columns in tenant_profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tenant_profiles'
ORDER BY ordinal_position;

-- 3. Count migrated records
SELECT 
    COUNT(*) as total_tenant_profiles,
    COUNT(CASE WHEN preferred_locations IS NOT NULL THEN 1 END) as with_locations,
    COUNT(CASE WHEN budget_min IS NOT NULL THEN 1 END) as with_budget,
    COUNT(CASE WHEN housing_type IS NOT NULL THEN 1 END) as with_housing_type
FROM tenant_profiles;

-- 4. Show RLS policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'tenant_profiles'
ORDER BY policyname;

-- 5. Compare with user_profiles
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role LIKE '%tenant%' OR role LIKE '%seeker%' THEN 1 END) as tenant_users
FROM user_profiles
UNION ALL
SELECT 
    'tenant_profiles' as table_name,
    COUNT(*) as total_users,
    COUNT(*) as tenant_users
FROM tenant_profiles;

-- 6. Show sample tenant profiles
SELECT 
    tp.user_id,
    up.full_name,
    up.email,
    up.role,
    tp.preferred_locations,
    tp.budget_min,
    tp.budget_max,
    tp.housing_type,
    tp.move_in_date_start
FROM tenant_profiles tp
JOIN user_profiles up ON tp.user_id = up.id
LIMIT 10;

-- 7. Check for any tenants missing from tenant_profiles
SELECT 
    id,
    full_name,
    email,
    role
FROM user_profiles
WHERE (role LIKE '%tenant%' OR role LIKE '%seeker%')
AND id NOT IN (SELECT user_id FROM tenant_profiles)
LIMIT 10;

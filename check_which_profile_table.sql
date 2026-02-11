-- Check Which Profile Table Actually Exists
-- Determine if it's user_profiles or profiles

-- Step 1: Check all tables that might contain user profiles
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('profiles', 'user_profiles', 'auth.users')
AND table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name;

-- Step 2: Check which table has actual data
SELECT 
    'profiles table' as table_name,
    COUNT(*) as record_count
FROM profiles

UNION ALL

SELECT 
    'user_profiles table' as table_name,
    COUNT(*) as record_count
FROM user_profiles;

-- Step 3: Check which table is linked to properties
SELECT 
    'Property Link Check' as info_type,
    'properties.user_id references' as references,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'properties' 
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'user_id'
        ) THEN 'Has foreign key constraint'
        ELSE 'No foreign key constraint found'
    END as constraint_status;

-- Step 4: Check which table has our landlord data
SELECT 
    'Landlord Data Location' as info_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM profiles 
            WHERE id IN (SELECT user_id FROM properties LIMIT 1)
        ) THEN 'profiles table has landlord data'
        ELSE 'profiles table does not have landlord data'
    END as profiles_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id IN (SELECT user_id FROM properties LIMIT 1)
        ) THEN 'user_profiles table has landlord data'
        ELSE 'user_profiles table does not have landlord data'
    END as user_profiles_check;

-- Step 5: Show the actual table being used by properties
SELECT 
    'Active Profile Table' as info_type,
    p.id as property_id,
    p.user_id as owner_id,
    CASE 
        WHEN pr.id IS NOT NULL THEN 'profiles table'
        WHEN upr.id IS NOT NULL THEN 'user_profiles table'
        ELSE 'No matching profile found'
    END as active_table,
    pr.full_name as profiles_name,
    pr.email as profiles_email,
    upr.full_name as user_profiles_name,
    upr.email as user_profiles_email
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id
LEFT JOIN user_profiles upr ON p.user_id = upr.id
ORDER BY p.created_at DESC
LIMIT 5;

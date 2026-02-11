-- Check all dependencies on profiles table before dropping
-- This will show us what objects depend on profiles table

-- Step 1: Check all foreign key constraints that reference profiles
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'profiles'
    AND tc.table_schema = 'public';

-- Step 2: Check all RLS policies that reference profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE qual ILIKE '%profiles%' 
   OR with_check ILIKE '%profiles%';

-- Step 3: Check all views that reference profiles
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views 
WHERE definition ILIKE '%profiles%'
   AND schemaname = 'public';

-- Step 4: Check all functions that reference profiles
SELECT 
    proname,
    prosrc,
    prolang
FROM pg_proc 
WHERE prosrc ILIKE '%profiles%'
   AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

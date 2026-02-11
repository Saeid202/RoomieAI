-- Check RLS Policies for Landlord Name Access
-- Verify if tenants are allowed to see landlord names

-- Step 1: Check all RLS policies on properties table
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
WHERE tablename IN ('properties', 'user_profiles', 'public_property_owners')
ORDER BY tablename, policyname;

-- Step 2: Check if RLS is enabled on these tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('properties', 'user_profiles', 'public_property_owners')
AND schemaname = 'public';

-- Step 3: Check if public_property_owners view has access policies
SELECT 
    'View Access Check' as check_type,
    table_schema,
    table_name,
    table_type,
    CASE 
        WHEN table_name = 'public_property_owners' THEN '✅ VIEW EXISTS'
        ELSE '❌ VIEW MISSING'
    END as status
FROM information_schema.tables 
WHERE table_name = 'public_property_owners'
AND table_schema = 'public';

-- Step 4: Test what anonymous users can see from properties
-- This simulates what tenants see
SELECT 
    'Anonymous Properties Access' as check_type,
    COUNT(*) as total_properties,
    COUNT(CASE WHEN listing_title IS NOT NULL THEN 1 END) as with_titles,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user_id
FROM properties;

-- Step 5: Test what anonymous users can see from user_profiles
-- This simulates what tenants see
SELECT 
    'Anonymous User Profiles Access' as check_type,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as with_names,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as with_emails
FROM user_profiles;

-- Step 6: Test what anonymous users can see from the view
-- This simulates what tenants see
SELECT 
    'Anonymous View Access' as check_type,
    COUNT(*) as total_view_records,
    COUNT(CASE WHEN owner_name IS NOT NULL THEN 1 END) as with_owner_names,
    COUNT(CASE WHEN owner_email IS NOT NULL THEN 1 END) as with_owner_emails
FROM public_property_owners;

-- Step 7: Check if there are any restrictive policies blocking access
SELECT 
    'Policy Restriction Check' as check_type,
    policyname,
    cmd,
    qual,
    CASE 
        WHEN qual IS NULL THEN '❌ NO RESTRICTION'
        WHEN qual LIKE '%anon%' THEN '✅ ALLOWS ANONYMOUS'
        WHEN qual LIKE '%authenticated%' THEN '🔒 REQUIRES AUTH'
        ELSE '❓ UNKNOWN POLICY'
    END as access_level
FROM pg_policies 
WHERE tablename = 'properties'
AND schemaname = 'public';

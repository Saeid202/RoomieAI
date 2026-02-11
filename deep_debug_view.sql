-- Deep Debug - Why View Still Shows NULL Names
-- Let's check the actual data and fix the real issue

-- Step 1: Check the exact data in profiles table
SELECT 
    'Raw Profiles Data' as info_type,
    id,
    full_name,
    email,
    CASE 
        WHEN full_name IS NULL THEN 'NULL'
        WHEN full_name = '' THEN 'EMPTY STRING'
        ELSE 'HAS VALUE'
    END as full_name_status
FROM profiles
WHERE id IN (SELECT user_id FROM properties);

-- Step 2: Check the exact data in properties table
SELECT 
    'Raw Properties Data' as info_type,
    id,
    user_id,
    listing_title,
    CASE 
        WHEN user_id IS NULL THEN 'NULL USER_ID'
        ELSE 'HAS USER_ID'
    END as user_id_status
FROM properties;

-- Step 3: Test the join manually to see where it fails
SELECT 
    'Manual Join Test' as info_type,
    p.id as property_id,
    p.user_id,
    pr.id as profile_id,
    pr.full_name,
    pr.email,
    CASE 
        WHEN p.user_id = pr.id THEN '✅ MATCH'
        ELSE '❌ NO MATCH'
    END as join_status
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id;

-- Step 4: Check if there are any data type issues
SELECT 
    'Data Type Check' as info_type,
    'properties.user_id' as column_name,
    'uuid' as expected_type,
    'uuid' as actual_type
UNION ALL
SELECT 
    'Data Type Check' as info_type,
    'profiles.id' as column_name,
    'uuid' as expected_type,
    'uuid' as actual_type;

-- Step 5: Force update the profile with a test name
UPDATE profiles 
SET full_name = 'Test Landlord Name'
WHERE id IN (SELECT user_id FROM properties)
AND (full_name IS NULL OR full_name = '');

-- Step 6: Check if the update worked
SELECT 
    'After Profile Update' as info_type,
    id,
    full_name,
    email
FROM profiles
WHERE id IN (SELECT user_id FROM properties);

-- Step 7: Recreate view with explicit debugging
DROP VIEW IF EXISTS public_property_owners;

CREATE VIEW public_property_owners AS
SELECT 
    p.id as property_id,
    p.user_id,
    pr.full_name as owner_name,
    pr.email as owner_email,
    p.listing_title,
    p.created_at as property_created_at
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id;

-- Step 8: Test the recreated view
SELECT 
    'Recreated View Test' as info_type,
    property_id,
    user_id,
    owner_name,
    owner_email,
    listing_title,
    CASE 
        WHEN owner_name IS NULL THEN '❌ STILL NULL'
        WHEN owner_name = '' THEN '❌ EMPTY'
        ELSE '✅ HAS NAME'
    END as name_status
FROM public_property_owners
ORDER BY property_created_at DESC;

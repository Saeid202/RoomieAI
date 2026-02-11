-- Debug and Fix Landlord Name Display Issue
-- Check the current state of profiles and properties

-- Step 1: Check if the public_property_owners view exists and its structure
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'public_property_owners' 
ORDER BY ordinal_position;

-- Step 2: If view doesn't exist, check what we have in profiles table
SELECT 
    'Profiles Table Structure' as info_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 3: Check sample data in profiles table
SELECT 
    id,
    full_name,
    email,
    created_at
FROM profiles 
LIMIT 5;

-- Step 4: Check properties table to see user_id references
SELECT 
    'Properties Sample' as info_type,
    id,
    user_id,
    listing_title,
    created_at
FROM properties 
LIMIT 5;

-- Step 5: Check if there are any properties with missing owner names
SELECT 
    p.id as property_id,
    p.user_id,
    p.listing_title,
    pr.full_name as owner_name,
    pr.email as owner_email,
    CASE 
        WHEN pr.full_name IS NULL OR pr.full_name = '' THEN 'Missing Name'
        ELSE 'Has Name'
    END as name_status
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id
LIMIT 10;

-- Step 6: Create or recreate the public_property_owners view
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

-- Step 7: Test the view
SELECT 
    'View Test Results' as info_type,
    property_id,
    user_id,
    owner_name,
    owner_email,
    listing_title
FROM public_property_owners
LIMIT 5;

-- Step 8: Check for properties with missing owner names in the view
SELECT 
    'Missing Owner Names' as info_type,
    COUNT(*) as total_properties,
    COUNT(CASE WHEN owner_name IS NULL OR owner_name = '' THEN 1 END) as missing_names,
    COUNT(CASE WHEN owner_name IS NOT NULL AND owner_name != '' THEN 1 END) as has_names
FROM public_property_owners;

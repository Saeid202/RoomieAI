-- Detailed Profile and Table Structure Check
-- Verify the landlord profile is fully saved with name

-- Step 1: Check the complete profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check all data in the landlord's profile
SELECT 
    'Complete Profile Data' as check_type,
    id,
    full_name,
    email,
    first_name,
    last_name,
    phone,
    avatar_url,
    created_at,
    updated_at,
    raw_user_meta_data,
    CASE 
        WHEN full_name IS NULL THEN '❌ full_name is NULL'
        WHEN full_name = '' THEN '❌ full_name is empty'
        ELSE '✅ full_name has value'
    END as full_name_status,
    CASE 
        WHEN first_name IS NULL THEN '❌ first_name is NULL'
        WHEN first_name = '' THEN '❌ first_name is empty'
        ELSE '✅ first_name has value'
    END as first_name_status,
    CASE 
        WHEN last_name IS NULL THEN '❌ last_name is NULL'
        WHEN last_name = '' THEN '❌ last_name is empty'
        ELSE '✅ last_name has value'
    END as last_name_status
FROM profiles
WHERE id IN (SELECT user_id FROM properties LIMIT 1);

-- Step 3: Check if there are multiple profiles and which one belongs to the property
SELECT 
    'All Profiles vs Property Owner' as check_type,
    p.id as property_id,
    p.user_id as property_user_id,
    pr.id as profile_id,
    pr.full_name,
    pr.email,
    CASE 
        WHEN p.user_id = pr.id THEN '✅ PROPERTY OWNER'
        ELSE '❌ NOT PROPERTY OWNER'
    END as ownership_status
FROM properties p
CROSS JOIN profiles pr
ORDER BY p.created_at DESC, pr.created_at DESC
LIMIT 10;

-- Step 4: Check the exact property and its owner details
SELECT 
    'Property Owner Details' as check_type,
    prop.id as property_id,
    prop.listing_title,
    prop.user_id as owner_id,
    prof.full_name,
    prof.email,
    prof.created_at as profile_created,
    prop.created_at as property_created,
    CASE 
        WHEN prof.full_name IS NOT NULL AND prof.full_name != '' THEN '✅ HAS NAME'
        ELSE '❌ NO NAME'
    END as name_status
FROM properties prop
LEFT JOIN profiles prof ON prop.user_id = prof.id
ORDER BY prop.created_at DESC;

-- Step 5: Check if the name was properly saved (not just updated in view)
SELECT 
    'Name Save Verification' as check_type,
    id,
    full_name,
    email,
    LENGTH(full_name) as name_length,
    CASE 
        WHEN LENGTH(full_name) > 0 THEN '✅ NAME SAVED'
        ELSE '❌ NAME NOT SAVED'
    END as save_status
FROM profiles
WHERE id IN (SELECT user_id FROM properties LIMIT 1);

-- Step 6: Check for any data inconsistencies
SELECT 
    'Data Consistency Check' as check_type,
    'profiles table' as table_name,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 END) as with_name,
    COUNT(CASE WHEN full_name IS NULL OR full_name = '' THEN 1 END) as without_name
FROM profiles

UNION ALL

SELECT 
    'Data Consistency Check' as check_type,
    'properties table' as table_name,
    COUNT(*) as total_properties,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_owner,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as without_owner
FROM properties;

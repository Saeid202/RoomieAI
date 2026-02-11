-- Comprehensive Landlord Profile Save Check
-- Verify the landlord profile is completely and properly saved

-- Step 1: Check the complete profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check the landlord's complete profile data
SELECT 
    'Complete Landlord Profile' as check_type,
    id,
    full_name,
    email,
    created_at,
    updated_at,
    raw_user_meta_data,
    CASE 
        WHEN full_name IS NULL THEN '❌ full_name is NULL'
        WHEN full_name = '' THEN '❌ full_name is empty'
        WHEN LENGTH(full_name) = 0 THEN '❌ full_name is zero length'
        ELSE '✅ full_name is properly saved'
    END as full_name_check,
    CASE 
        WHEN email IS NULL THEN '❌ email is NULL'
        WHEN email = '' THEN '❌ email is empty'
        ELSE '✅ email is properly saved'
    END as email_check,
    LENGTH(COALESCE(full_name, '')) as name_length,
    LENGTH(COALESCE(email, '')) as email_length
FROM profiles
WHERE id IN (SELECT user_id FROM properties LIMIT 1);

-- Step 3: Check if the profile is properly linked to the property
SELECT 
    'Property-Profile Link' as check_type,
    p.id as property_id,
    p.listing_title,
    p.user_id as property_owner_id,
    pr.id as profile_id,
    pr.full_name as profile_name,
    pr.email as profile_email,
    CASE 
        WHEN p.user_id = pr.id THEN '✅ Properly linked'
        WHEN p.user_id IS NULL THEN '❌ Property has no owner'
        WHEN pr.id IS NULL THEN '❌ Profile not found'
        ELSE '❌ Mismatched IDs'
    END as link_status
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id
ORDER BY p.created_at DESC;

-- Step 4: Check for any data integrity issues
SELECT 
    'Data Integrity Check' as check_type,
    COUNT(*) as total_properties,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as properties_with_owner,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as properties_without_owner,
    COUNT(CASE WHEN p.user_id = pr.id AND pr.full_name IS NOT NULL AND pr.full_name != '' THEN 1 END) as properties_with_named_owner,
    COUNT(CASE WHEN p.user_id = pr.id AND (pr.full_name IS NULL OR pr.full_name = '') THEN 1 END) as properties_with_unnamed_owner
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id;

-- Step 5: Verify the name update actually persisted
SELECT 
    'Name Persistence Check' as check_type,
    id,
    full_name,
    email,
    updated_at,
    CASE 
        WHEN full_name LIKE '%CLEARLY VISIBLE%' THEN '✅ Test name is saved'
        WHEN full_name IS NULL OR full_name = '' THEN '❌ Name is missing'
        ELSE '✅ Original name is saved'
    END as persistence_status,
    EXTRACT(EPOCH FROM (NOW() - updated_at)) as seconds_since_update
FROM profiles
WHERE id IN (SELECT user_id FROM properties LIMIT 1);

-- Step 6: Check if there are any authentication issues
SELECT 
    'Authentication Check' as check_type,
    id,
    email,
    raw_user_meta_data,
    CASE 
        WHEN raw_user_meta_data IS NOT NULL THEN '✅ Has metadata'
        ELSE '❌ No metadata'
    END as metadata_status
FROM profiles
WHERE id IN (SELECT user_id FROM properties LIMIT 1);

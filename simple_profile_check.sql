-- Simple Profile Check - Only Existing Columns
-- Verify the landlord profile is fully saved with name

-- Step 1: Check what columns actually exist in profiles table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check the landlord's profile data (only confirmed existing columns)
SELECT 
    'Profile Data Check' as check_type,
    id,
    full_name,
    email,
    created_at,
    updated_at,
    CASE 
        WHEN full_name IS NULL THEN '❌ full_name is NULL'
        WHEN full_name = '' THEN '❌ full_name is empty'
        ELSE '✅ full_name has value'
    END as full_name_status,
    LENGTH(COALESCE(full_name, '')) as name_length
FROM profiles
WHERE id IN (SELECT user_id FROM properties LIMIT 1);

-- Step 3: Check property and owner relationship
SELECT 
    'Property Owner Check' as check_type,
    prop.id as property_id,
    prop.listing_title,
    prop.user_id as owner_id,
    prof.full_name,
    prof.email,
    CASE 
        WHEN prof.full_name IS NOT NULL AND prof.full_name != '' THEN '✅ HAS NAME'
        ELSE '❌ NO NAME'
    END as name_status
FROM properties prop
LEFT JOIN profiles prof ON prop.user_id = prof.id
ORDER BY prop.created_at DESC;

-- Step 4: Verify name is actually saved
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

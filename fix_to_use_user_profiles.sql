-- Fix System to Use user_profiles Table Instead of profiles
-- Update the view to query from user_profiles

-- Step 1: Check user_profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check if user_profiles has the landlord data
SELECT 
    'User Profiles Data Check' as check_type,
    id,
    full_name,
    email,
    created_at,
    updated_at,
    CASE 
        WHEN full_name IS NULL OR full_name = '' THEN '❌ NO NAME'
        ELSE '✅ HAS NAME'
    END as name_status
FROM user_profiles
WHERE id IN (SELECT user_id FROM properties LIMIT 1);

-- Step 3: Update user_profiles with the test name if needed
UPDATE user_profiles 
SET full_name = 'Landlord Test Name - CLEARLY VISIBLE',
    updated_at = NOW()
WHERE id IN (SELECT user_id FROM properties LIMIT 1)
AND (full_name IS NULL OR full_name = '');

-- Step 4: Recreate the view to use user_profiles instead of profiles
DROP VIEW IF EXISTS public_property_owners;

CREATE VIEW public_property_owners AS
SELECT 
    p.id as property_id,
    p.user_id,
    up.full_name as owner_name,
    up.email as owner_email,
    p.listing_title,
    p.created_at as property_created_at
FROM properties p
LEFT JOIN user_profiles up ON p.user_id = up.id;

-- Step 5: Test the updated view
SELECT 
    'Updated View Test' as check_type,
    property_id,
    owner_name,
    owner_email,
    listing_title,
    CASE 
        WHEN owner_name LIKE '%CLEARLY VISIBLE%' THEN '✅ TEST NAME FROM user_profiles'
        WHEN owner_name IS NOT NULL AND owner_name != '' THEN '✅ HAS NAME FROM user_profiles'
        ELSE '❌ NO NAME FROM user_profiles'
    END as test_status
FROM public_property_owners
ORDER BY property_created_at DESC;

-- Step 6: Verify the data is coming from user_profiles
SELECT 
    'Source Verification' as check_type,
    'user_profiles table' as data_source,
    COUNT(*) as total_properties,
    COUNT(CASE WHEN owner_name IS NOT NULL AND owner_name != '' THEN 1 END) as with_names,
    COUNT(CASE WHEN owner_name IS NULL OR owner_name = '' THEN 1 END) as without_names
FROM public_property_owners;

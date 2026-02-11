-- Ultimate Debug Script - Check Every Step
-- Verify the complete data flow from database to frontend

-- Step 1: Confirm user_profiles has the data
SELECT 
    'User Profiles Confirmation' as check_type,
    id,
    full_name,
    email,
    CASE 
        WHEN full_name LIKE '%CLEARLY VISIBLE%' THEN '✅ TEST NAME IN user_profiles'
        WHEN full_name IS NOT NULL AND full_name != '' THEN '✅ HAS NAME IN user_profiles'
        ELSE '❌ NO NAME IN user_profiles'
    END as status
FROM user_profiles
WHERE id IN (SELECT user_id FROM properties LIMIT 1);

-- Step 2: Confirm the view is using user_profiles
SELECT 
    'View Confirmation' as check_type,
    property_id,
    owner_name,
    owner_email,
    CASE 
        WHEN owner_name LIKE '%CLEARLY VISIBLE%' THEN '✅ TEST NAME IN VIEW'
        WHEN owner_name IS NOT NULL AND owner_name != '' THEN '✅ HAS NAME IN VIEW'
        ELSE '❌ NO NAME IN VIEW'
    END as view_status
FROM public_property_owners
ORDER BY property_created_at DESC;

-- Step 3: Test the exact query the frontend makes
SELECT 
    'Frontend Query Test' as check_type,
    owner_name,
    owner_email
FROM public_property_owners
WHERE property_id = (SELECT id FROM properties ORDER BY created_at DESC LIMIT 1);

-- Step 4: Check if there are multiple properties and which one we're testing
SELECT 
    'All Properties Check' as check_type,
    id,
    listing_title,
    user_id,
    created_at,
    CASE 
        WHEN id = (SELECT id FROM properties ORDER BY created_at DESC LIMIT 1) THEN '✅ LATEST PROPERTY'
        ELSE '❌ OLDER PROPERTY'
    END as property_status
FROM properties
ORDER BY created_at DESC;

-- Step 5: Force update with a completely different name to bypass any caching
UPDATE user_profiles 
SET full_name = 'FINAL TEST NAME - ' || EXTRACT(EPOCH FROM NOW())::text,
    updated_at = NOW()
WHERE id IN (SELECT user_id FROM properties LIMIT 1);

-- Step 6: Verify the force update worked
SELECT 
    'Force Update Verification' as check_type,
    id,
    full_name,
    updated_at,
    EXTRACT(EPOCH FROM (NOW() - updated_at)) as seconds_ago
FROM user_profiles
WHERE id IN (SELECT user_id FROM properties LIMIT 1);

-- Step 7: Recreate view again to ensure no caching
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

-- Step 8: Final test with timestamped name
SELECT 
    'Final Test with Timestamp' as check_type,
    property_id,
    owner_name,
    listing_title,
    CASE 
        WHEN owner_name LIKE 'FINAL TEST NAME%' THEN '✅ TIMESTAMPED NAME WORKING'
        ELSE '❌ TIMESTAMPED NAME FAILED'
    END as final_status
FROM public_property_owners
ORDER BY property_created_at DESC;

-- Force Update Profile with Clear Name
-- Ensure the name is unmistakably clear for UI

-- Step 1: Update the profile with a very clear test name
UPDATE profiles 
SET full_name = 'Landlord Test Name - CLEARLY VISIBLE',
    updated_at = NOW()
WHERE id IN (SELECT user_id FROM properties LIMIT 1);

-- Step 2: Verify the update
SELECT 
    'After Force Update' as check_type,
    id,
    full_name,
    email,
    updated_at,
    LENGTH(full_name) as name_length
FROM profiles
WHERE id IN (SELECT user_id FROM properties LIMIT 1);

-- Step 3: Refresh the view to pick up changes
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

-- Step 4: Test the view with the new name
SELECT 
    'View with New Name' as check_type,
    property_id,
    owner_name,
    owner_email,
    listing_title,
    CASE 
        WHEN owner_name LIKE '%CLEARLY VISIBLE%' THEN '✅ TEST NAME VISIBLE'
        ELSE '❌ TEST NAME NOT VISIBLE'
    END as test_status
FROM public_property_owners
ORDER BY property_created_at DESC;

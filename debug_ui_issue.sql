-- Debug Why UI Still Shows "Property Owner"
-- Check if frontend is getting the updated data

-- Step 1: Verify the database has the correct data
SELECT 
    'Database Check' as info_type,
    po.property_id,
    po.owner_name,
    po.owner_email,
    p.listing_title,
    CASE 
        WHEN po.owner_name IS NOT NULL AND po.owner_name != 'Property Owner' THEN '✅ DB HAS NAME'
        ELSE '❌ DB NO NAME'
    END as db_status
FROM public_property_owners po
JOIN properties p ON po.property_id = p.id
ORDER BY p.created_at DESC;

-- Step 2: Test the exact query the frontend uses for rental properties
SELECT 
    'Frontend Rental Query' as info_type,
    owner_name,
    owner_email
FROM public_property_owners
WHERE property_id = (SELECT id FROM properties WHERE property_type = 'rental' ORDER BY created_at DESC LIMIT 1);

-- Step 3: Test the exact query the frontend uses for sales properties
SELECT 
    'Frontend Sales Query' as info_type,
    owner_name,
    owner_email
FROM public_property_owners
WHERE property_id = (SELECT id FROM properties WHERE property_type = 'sales' ORDER BY created_at DESC LIMIT 1);

-- Step 4: Check if there are multiple properties and which one is showing
SELECT 
    'All Properties Status' as info_type,
    p.id,
    p.listing_title,
    p.property_type,
    po.owner_name,
    CASE 
        WHEN po.owner_name IS NOT NULL AND po.owner_name != 'Property Owner' THEN '✅ HAS NAME'
        ELSE '❌ NO NAME'
    END as name_status
FROM properties p
LEFT JOIN public_property_owners po ON p.id = po.property_id
ORDER BY p.created_at DESC;

-- Step 5: Force refresh the view to ensure no caching
DROP VIEW IF EXISTS public_property_owners;

CREATE VIEW public_property_owners AS
SELECT 
    p.id as property_id,
    p.user_id,
    COALESCE(pr.full_name, 'Property Owner') as owner_name,
    pr.email as owner_email,
    p.listing_title,
    p.created_at as property_created_at
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id;

-- Step 6: Test the refreshed view
SELECT 
    'Refreshed View Test' as info_type,
    property_id,
    owner_name,
    owner_email,
    listing_title,
    CASE 
        WHEN owner_name IS NOT NULL AND owner_name != 'Property Owner' THEN '✅ REFRESHED HAS NAME'
        ELSE '❌ REFRESHED NO NAME'
    END as refreshed_status
FROM public_property_owners
ORDER BY property_created_at DESC;

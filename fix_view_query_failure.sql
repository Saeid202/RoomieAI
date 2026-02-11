-- Quick Fix for View Query Failure
-- The view is not working, let's fix it immediately

-- Step 1: Check what's wrong with the current view
SELECT 
    'Current View Test' as test_type,
    po.property_id,
    po.user_id,
    po.owner_name,
    po.owner_email
FROM public_property_owners po
LIMIT 5;

-- Step 2: Check the raw data that should be in the view
SELECT 
    'Raw Data Test' as test_type,
    p.id as property_id,
    p.user_id,
    pr.full_name,
    pr.email,
    CASE 
        WHEN pr.full_name IS NULL OR pr.full_name = '' THEN '❌ NO NAME'
        ELSE '✅ HAS NAME'
    END as name_status
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id
LIMIT 5;

-- Step 3: Recreate view with explicit debugging
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

-- Step 4: Test the recreated view
SELECT 
    'Recreated View Test' as test_type,
    property_id,
    user_id,
    owner_name,
    owner_email,
    CASE 
        WHEN owner_name IS NOT NULL AND owner_name != 'Property Owner' THEN '✅ FIXED'
        ELSE '❌ STILL BROKEN'
    END as fix_status
FROM public_property_owners
LIMIT 5;

-- Step 5: Test the exact query the frontend uses
SELECT 
    'Frontend Query Test' as test_type,
    owner_name,
    owner_email
FROM public_property_owners
WHERE property_id = 'YOUR_PROPERTY_ID_HERE' -- Replace with actual property ID from console
LIMIT 1;

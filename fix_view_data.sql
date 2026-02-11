-- Quick Fix for View Data Issue
-- The view is not properly joining profiles with properties

-- Step 1: Recreate the view with correct join logic
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

-- Step 2: Test the view immediately
SELECT 
    'Fixed View Test' as info_type,
    property_id,
    user_id,
    owner_name,
    owner_email,
    listing_title,
    CASE 
        WHEN owner_name IS NOT NULL AND owner_name != 'Property Owner' THEN '✅ HAS REAL NAME'
        WHEN owner_name = 'Property Owner' THEN '⚠️ DEFAULT NAME'
        ELSE '❌ NULL NAME'
    END as name_status
FROM public_property_owners
ORDER BY property_created_at DESC;

-- Step 3: Test the exact frontend query
SELECT 
    'Frontend Query Test' as info_type,
    owner_name,
    owner_email
FROM public_property_owners
WHERE property_id = (SELECT id FROM properties ORDER BY created_at DESC LIMIT 1);

-- Step 4: Final verification
SELECT 
    'Final Verification' as info_type,
    p.id as property_id,
    p.listing_title,
    po.owner_name as landlord_name,
    po.owner_email as landlord_email,
    CASE 
        WHEN po.owner_name IS NOT NULL AND po.owner_name != 'Property Owner' THEN '✅ READY FOR UI'
        ELSE '❌ STILL MISSING'
    END as ui_ready
FROM properties p
LEFT JOIN public_property_owners po ON p.id = po.property_id
ORDER BY p.created_at DESC;

-- Comprehensive Debug for Single Landlord Listing
-- Check everything to ensure landlord name displays correctly

-- Step 1: Find the single landlord listing
SELECT 
    'All Properties' as info_type,
    p.id,
    p.user_id,
    p.listing_title,
    p.property_type,
    p.created_at
FROM properties p
ORDER BY p.created_at DESC;

-- Step 2: Check the landlord's profile for this property
SELECT 
    'Landlord Profile' as info_type,
    pr.id,
    pr.full_name,
    pr.email,
    pr.created_at,
    CASE 
        WHEN pr.full_name IS NULL OR pr.full_name = '' THEN 'MISSING NAME'
        ELSE 'HAS NAME'
    END as name_status
FROM profiles pr
WHERE pr.id IN (SELECT user_id FROM properties LIMIT 1);

-- Step 3: Check the public_property_owners view for this specific property
SELECT 
    'View Data for Property' as info_type,
    po.property_id,
    po.user_id,
    po.owner_name,
    po.owner_email,
    po.listing_title,
    CASE 
        WHEN po.owner_name IS NULL OR po.owner_name = '' THEN 'MISSING IN VIEW'
        ELSE 'AVAILABLE IN VIEW'
    END as view_status
FROM public_property_owners po
ORDER BY po.property_created_at DESC
LIMIT 5;

-- Step 4: Test the exact query the frontend uses
SELECT 
    'Frontend Query Test' as info_type,
    owner_name,
    owner_email
FROM public_property_owners
WHERE property_id = (SELECT id FROM properties ORDER BY created_at DESC LIMIT 1);

-- Step 5: If missing name, fix it by updating the profile
-- First, let's see what email we have to create a name from
SELECT 
    'Profile Update Candidates' as info_type,
    id,
    email,
    full_name,
    CASE 
        WHEN full_name IS NULL OR full_name = '' THEN 'NEEDS UPDATE'
        ELSE 'OK'
    END as update_needed
FROM profiles
WHERE id IN (SELECT user_id FROM properties)
AND (full_name IS NULL OR full_name = '');

-- Step 6: Update missing names using email (if needed)
UPDATE profiles 
SET full_name = 
    CASE 
        WHEN full_name IS NULL OR full_name = '' THEN 
            CASE 
                WHEN email LIKE '%@%' THEN SPLIT_PART(email, '@', 1)
                ELSE 'Property Owner'
            END
        ELSE full_name
    END
WHERE id IN (SELECT user_id FROM properties)
AND (full_name IS NULL OR full_name = '');

-- Step 7: Verify the update worked
SELECT 
    'After Update' as info_type,
    pr.id,
    pr.full_name,
    pr.email,
    po.owner_name as view_owner_name,
    po.owner_email as view_owner_email
FROM profiles pr
JOIN public_property_owners po ON pr.id = po.user_id
WHERE pr.id IN (SELECT user_id FROM properties);

-- Step 8: Final test - simulate frontend fetch
SELECT 
    'Final Frontend Test' as info_type,
    p.id as property_id,
    p.listing_title,
    po.owner_name as landlord_name,
    po.owner_email as landlord_email,
    CASE 
        WHEN po.owner_name IS NOT NULL AND po.owner_name != '' THEN '✅ READY FOR UI'
        ELSE '❌ STILL MISSING'
    END as ui_ready
FROM properties p
LEFT JOIN public_property_owners po ON p.id = po.property_id
ORDER BY p.created_at DESC;

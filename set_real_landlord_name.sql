-- Set the Real Landlord Name
-- Update the profile with the actual landlord name

-- Step 1: Check what email we have for the landlord
SELECT 
    'Landlord Email' as info_type,
    id,
    email,
    full_name as current_name
FROM profiles
WHERE id IN (SELECT user_id FROM properties);

-- Step 2: Update with a proper name based on email or use a default
UPDATE profiles 
SET full_name = 
    CASE 
        WHEN email LIKE '%info@cargoplus.site%' THEN 'Cargo Plus Team'
        WHEN email LIKE '%@%' THEN 
            CASE 
                WHEN POSITION(' ' IN SPLIT_PART(email, '@', 1)) > 0 
                THEN INITCAP(SPLIT_PART(email, '@', 1))
                ELSE INITCAP(REPLACE(SPLIT_PART(email, '@', 1), '.', ' '))
            END
        ELSE 'Property Owner'
    END
WHERE id IN (SELECT user_id FROM properties);

-- Step 3: Verify the update
SELECT 
    'Updated Profile' as info_type,
    id,
    email,
    full_name as updated_name
FROM profiles
WHERE id IN (SELECT user_id FROM properties);

-- Step 4: Test the view with the real name
SELECT 
    'Final View Test' as info_type,
    property_id,
    owner_name,
    owner_email,
    listing_title,
    CASE 
        WHEN owner_name IS NOT NULL AND owner_name != 'Property Owner' THEN '✅ REAL NAME READY'
        ELSE '❌ STILL DEFAULT'
    END as name_status
FROM public_property_owners
ORDER BY property_created_at DESC;

-- Step 5: Final frontend simulation
SELECT 
    'Frontend Ready Test' as info_type,
    p.id as property_id,
    p.listing_title,
    po.owner_name as landlord_name,
    CASE 
        WHEN po.owner_name IS NOT NULL AND po.owner_name != 'Property Owner' THEN '✅ READY FOR UI'
        ELSE '❌ NOT READY'
    END as ui_status
FROM properties p
LEFT JOIN public_property_owners po ON p.id = po.property_id
ORDER BY p.created_at DESC;

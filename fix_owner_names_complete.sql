-- Complete fix for property owner names not appearing
-- This addresses both database and frontend issues

-- Step 1: Force update all missing names
UPDATE profiles 
SET full_name = CASE 
    WHEN full_name IS NULL OR full_name = '' THEN 
        CASE 
            WHEN email = 'info@cargoplus.site' THEN 'CargoPlus Owner'
            WHEN email LIKE '%@%' THEN SPLIT_PART(email, '@', 1)
            ELSE 'Property Owner'
        END
    ELSE full_name
END
WHERE full_name IS NULL OR full_name = '';

-- Step 2: Verify the update worked
SELECT 
    'Profile Update Results' as operation,
    COUNT(*) as updated_profiles,
    COUNT(CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 END) as profiles_with_names
FROM profiles 
WHERE email LIKE '%cargoplus%' OR email LIKE '%@%';

-- Step 3: Check specific user
SELECT 
    'info@cargoplus.site Status' as check_type,
    p.id as profile_id,
    p.full_name as current_name,
    p.email as email,
    CASE 
        WHEN p.full_name IS NULL OR p.full_name = '' THEN '❌ Still missing name'
        ELSE '✅ Has name'
    END as name_status
FROM profiles p
WHERE p.email = 'info@cargoplus.site';

-- Step 4: Check their properties with owner names
SELECT 
    'Property Check' as check_type,
    pr.id as property_id,
    pr.listing_title,
    pr.user_id,
    p.full_name as owner_name,
    p.email as owner_email,
    CASE 
        WHEN p.full_name IS NULL OR p.full_name = '' THEN '❌ No owner name'
        ELSE '✅ Has owner name'
    END as name_status
FROM properties pr
LEFT JOIN profiles p ON pr.user_id = p.id
WHERE p.email = 'info@cargoplus.site'
LIMIT 3;

-- Step 5: Create a simple view for public listings
CREATE OR REPLACE VIEW public_property_owners AS
SELECT 
    pr.id as property_id,
    pr.listing_title,
    pr.user_id,
    COALESCE(p.full_name, 'Property Owner') as owner_name,
    p.email as owner_email
FROM properties pr
LEFT JOIN profiles p ON pr.user_id = p.id;

-- Step 6: Test the view
SELECT * FROM public_property_owners WHERE owner_email LIKE '%cargoplus%' LIMIT 3;

-- Enhanced test to debug property owner names issue
-- This will help identify why names aren't showing

-- Check if info@cargoplus.site properties have names
SELECT 
    p.id as property_id,
    p.listing_title,
    p.user_id as owner_id,
    pr.full_name as owner_name,
    pr.email as owner_email,
    CASE 
        WHEN pr.full_name IS NULL OR pr.full_name = '' THEN 'MISSING NAME'
        ELSE 'HAS NAME'
    END as name_status
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id
WHERE p.user_id = 'AUTH_USER_ID_OF_INFO@CARGOPLUS.SITE'  -- Replace with actual user_id
LIMIT 5;

-- Check all properties with missing names
SELECT 
    COUNT(*) as total_properties,
    COUNT(CASE WHEN pr.full_name IS NULL OR pr.full_name = '' THEN 1 END) as missing_names,
    COUNT(CASE WHEN pr.full_name IS NOT NULL AND pr.full_name != '' THEN 1 END) as has_names
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id
WHERE p.is_active = true;

-- Check specific user profiles that might be info@cargoplus.site
SELECT 
    id,
    full_name,
    email,
    created_at
FROM profiles 
WHERE email = 'info@cargoplus.site'
LIMIT 5;

-- Update missing names with email as fallback
UPDATE profiles 
SET full_name = COALESCE(full_name, SPLIT_PART(email, '@', 1))
WHERE full_name IS NULL OR full_name = '';

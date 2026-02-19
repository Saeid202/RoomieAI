-- Debug landlord names for tenant dashboard
-- Check if property owners have proper names in user_profiles

-- Step 1: Check recent properties and their owners
SELECT 
    p.id as property_id,
    p.listing_title,
    p.user_id as landlord_id,
    p.landlord_name as current_landlord_name,
    p.created_at
FROM properties p 
WHERE p.status = 'active'
ORDER BY p.created_at DESC
LIMIT 10;

-- Step 2: Check if these landlords have user_profiles with full_name
SELECT 
    up.id,
    up.full_name,
    up.email,
    up.role,
    CASE 
        WHEN up.full_name IS NOT NULL AND up.full_name != '' THEN 'Has name'
        ELSE 'Missing name'
    END as name_status
FROM user_profiles up 
WHERE up.id IN (
    SELECT DISTINCT user_id FROM properties WHERE status = 'active' LIMIT 10
);

-- Step 3: Check public_property_owners view
SELECT 
    po.property_id,
    po.owner_name,
    po.owner_email
FROM public_property_owners po 
WHERE po.property_id IN (
    SELECT id FROM properties WHERE status = 'active' ORDER BY created_at DESC LIMIT 5
);

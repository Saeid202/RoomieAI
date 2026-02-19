-- Debug landlord names in properties
-- Check if the property owner has a profile record

-- Step 1: Find a sample property and its owner
SELECT 
    p.id as property_id,
    p.listing_title,
    p.user_id as landlord_id,
    p.landlord_name as current_landlord_name
FROM properties p 
LIMIT 5;

-- Step 2: Check if this landlord has a user_profiles record
SELECT 
    up.id,
    up.full_name,
    up.email,
    up.role,
    up.created_at
FROM user_profiles up 
WHERE up.id = 'REPLACE_WITH_ACTUAL_USER_ID_FROM_STEP_1';

-- Step 3: Check public_property_owners view for this property
SELECT 
    po.property_id,
    po.owner_name,
    po.owner_email
FROM public_property_owners po 
WHERE po.property_id = 'REPLACE_WITH_ACTUAL_PROPERTY_ID_FROM_STEP_1';

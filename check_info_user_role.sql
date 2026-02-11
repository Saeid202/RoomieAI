-- Check role of info@cargoplus.site user
-- This will show us what role this user has

-- First, find user ID from profiles
SELECT 
    id,
    full_name,
    email,
    created_at
FROM profiles 
WHERE email = 'info@cargoplus.site';

-- Then check their role in auth.users metadata
SELECT 
    id,
    email,
    raw_user_meta_data,
    raw_app_meta_data
FROM auth.users 
WHERE email = 'info@cargoplus.site';

-- Check if they have any properties listed
SELECT 
    COUNT(*) as rental_properties_count,
    'Rental' as property_type
FROM properties 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'info@cargoplus.site' LIMIT 1)
UNION ALL
SELECT 
    COUNT(*) as sales_properties_count,
    'Sales' as property_type
FROM sales_listings 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'info@cargoplus.site' LIMIT 1);

-- Check their assigned role from user_metadata
SELECT 
    email,
    CASE 
        WHEN raw_user_meta_data->>'assignedRole' IS NOT NULL THEN raw_user_meta_data->>'assignedRole'
        WHEN raw_user_meta_data->>'role' IS NOT NULL THEN raw_user_meta_data->>'role'
        ELSE 'No role found'
    END as assigned_role,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'info@cargoplus.site';

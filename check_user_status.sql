-- Quick status check for info@cargoplus.site
-- This will show us the current status of this user

-- Check user profile status
SELECT 
    'Profile Status' as check_type,
    CASE 
        WHEN p.id IS NOT NULL THEN '❌ Profile not found'
        WHEN p.full_name IS NULL OR p.full_name = '' THEN '⚠️ Missing name'
        ELSE '✅ Profile exists with name'
    END as status,
    p.id as profile_id,
    p.full_name,
    p.email,
    p.created_at as profile_created,
    p.updated_at as profile_updated
FROM profiles p
WHERE p.email = 'info@cargoplus.site';

-- Check auth status
SELECT 
    'Auth Status' as check_type,
    CASE 
        WHEN au.id IS NOT NULL THEN '❌ Auth not found'
        WHEN au.raw_user_meta_data->>'assignedRole' IS NOT NULL THEN '✅ Has role assigned'
        ELSE '⚠️ No role assigned'
    END as status,
    au.id as auth_id,
    au.email as auth_email,
    au.raw_user_meta_data->>'assignedRole' as assigned_role,
    au.created_at as auth_created,
    au.last_sign_in_at as last_sign_in
FROM auth.users au
WHERE au.email = 'info@cargoplus.site';

-- Check properties count
SELECT 
    'Properties Status' as check_type,
    COUNT(*) as property_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Has properties listed'
        ELSE '❌ No properties listed'
    END as status
FROM properties p
WHERE p.user_id = (SELECT id FROM profiles WHERE email = 'info@cargoplus.site' LIMIT 1);

-- Check sales listings count
SELECT 
    'Sales Status' as check_type,
    COUNT(*) as sales_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Has sales listed'
        ELSE '❌ No sales listed'
    END as status
FROM sales_listings s
WHERE s.user_id = (SELECT id FROM profiles WHERE email = 'info@cargoplus.site' LIMIT 1);

-- Combine all results
SELECT 'All checks completed' as status;

-- Debug why info@cargoplus.site name isn't showing
-- This will help us find the exact issue

-- Step 1: Find the user ID for info@cargoplus.site
SELECT 
    p.id as profile_id,
    p.full_name as profile_full_name,
    p.email as profile_email,
    p.created_at as profile_created
FROM profiles p
WHERE p.email = 'info@cargoplus.site';

-- Step 2: Check their auth.users record
SELECT 
    au.id as auth_id,
    au.email as auth_email,
    au.raw_user_meta_data,
    au.created_at as auth_created
FROM auth.users au
WHERE au.email = 'info@cargoplus.site';

-- Step 3: Check if they have any properties listed
SELECT 
    id,
    listing_title,
    user_id,
    created_at
FROM properties
WHERE user_id = (SELECT id FROM profiles WHERE email = 'info@cargoplus.site' LIMIT 1)
ORDER BY created_at DESC
LIMIT 5;

-- Step 4: Check exact join that should happen
SELECT 
    p.id as property_id,
    p.listing_title,
    p.user_id as property_user_id,
    pr.id as profile_id,
    pr.full_name as profile_full_name,
    pr.email as profile_email
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id
WHERE p.user_id = (SELECT id FROM profiles WHERE email = 'info@cargoplus.site' LIMIT 1)
LIMIT 3;

-- Step 5: Check if there are any NULL names or empty strings
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN full_name IS NULL THEN 1 END) as null_names,
    COUNT(CASE WHEN full_name = '' THEN 1 END) as empty_names,
    COUNT(CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 END) as valid_names
FROM profiles
WHERE email = 'info@cargoplus.site' OR email LIKE '%cargoplus%';

-- Step 6: Update the profile if name is missing
UPDATE profiles 
SET full_name = 'CargoPlus Owner'
WHERE email = 'info@cargoplus.site' 
AND (full_name IS NULL OR full_name = '');

-- Verify the update
SELECT 
    id,
    full_name,
    email,
    updated_at
FROM profiles
WHERE email = 'info@cargoplus.site';

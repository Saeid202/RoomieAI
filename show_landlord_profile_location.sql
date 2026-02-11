-- Show Where Landlord Profiles Are Saved
-- Complete database structure and location

-- Step 1: Show the main profiles table structure
SELECT 
    'Profiles Table Location' as info_type,
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- Step 2: Show all columns in profiles table
SELECT 
    'Profiles Table Columns' as info_type,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 3: Show actual landlord profile data location
SELECT 
    'Landlord Profile Data' as info_type,
    id as profile_id,
    full_name,
    email,
    created_at,
    updated_at,
    'public.profiles' as table_location,
    'This is where landlord profiles are stored' as description
FROM profiles
WHERE id IN (SELECT user_id FROM properties LIMIT 1);

-- Step 4: Show how profiles link to properties
SELECT 
    'Property-Profile Relationship' as info_type,
    'properties.user_id' as property_column,
    'profiles.id' as profile_column,
    'This foreign key links property to landlord profile' as relationship_type,
    'public.properties' as property_table,
    'public.profiles' as profile_table
FROM properties p
JOIN profiles pr ON p.user_id = pr.id
LIMIT 1;

-- Step 5: Show the complete data flow
SELECT 
    'Complete Data Flow' as info_type,
    '1. User signs up → public.profiles' as step1,
    '2. User creates property → public.properties (user_id links to profiles.id)' as step2,
    '3. Frontend queries public_property_owners view' as step3,
    '4. View joins properties.user_id = profiles.id' as step4,
    '5. Returns profiles.full_name as landlord name' as step5;

-- Step 6: Show all landlord profiles in the system
SELECT 
    'All Landlord Profiles' as info_type,
    COUNT(*) as total_landlord_profiles,
    COUNT(CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 END) as with_names,
    COUNT(CASE WHEN full_name IS NULL OR full_name = '' THEN 1 END) as without_names,
    'public.profiles' as storage_location
FROM profiles
WHERE id IN (SELECT user_id FROM properties);

-- Step 7: Show the exact location of our test landlord
SELECT 
    'Test Landlord Location' as info_type,
    pr.id as profile_id,
    pr.full_name,
    pr.email,
    p.id as property_id,
    p.listing_title,
    'public.profiles table' as profile_storage,
    'public.properties table' as property_storage,
    'Linked by: properties.user_id = profiles.id' as link_method
FROM profiles pr
JOIN properties p ON pr.id = p.user_id
ORDER BY p.created_at DESC
LIMIT 1;

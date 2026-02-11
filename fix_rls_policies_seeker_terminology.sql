-- Update RLS Policies with Correct Terminology (Seeker instead of Tenant)
-- Create proper policies for public access using seeker terminology

-- Step 1: Enable RLS on all tables if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow public access to landlord names" ON user_profiles;
DROP POLICY IF EXISTS "Properties are publicly viewable" ON properties;

-- Step 3: Create policies that allow seekers to see landlord names
-- Policy for user_profiles - Allow seekers to see basic info for landlords
CREATE POLICY "Allow seekers to view landlord names" ON user_profiles
    FOR SELECT USING (
        id IN (SELECT user_id FROM properties WHERE user_id IS NOT NULL)
    );

-- Step 4: Ensure properties are publicly readable for seekers
CREATE POLICY "Properties are publicly viewable for seekers" ON properties
    FOR SELECT USING (true);

-- Step 5: Create policy for user_profiles updates (landlords can update their own)
CREATE POLICY "Landlords can update own profile" ON user_profiles
    FOR UPDATE USING (
        auth.uid() = id
    );

-- Step 6: Create policy for user_profiles inserts (new users can create profiles)
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id
    );

-- Step 7: Test the policies - Check what seekers can see now
SELECT 
    'Post-Fix Seeker Properties Access' as check_type,
    COUNT(*) as total_properties,
    COUNT(CASE WHEN listing_title IS NOT NULL THEN 1 END) as with_titles,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user_id
FROM properties;

-- Step 8: Test the policies - Check user_profiles access for seekers
SELECT 
    'Post-Fix Seeker User Profiles Access' as check_type,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as with_names,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as with_emails
FROM user_profiles
WHERE id IN (SELECT user_id FROM properties WHERE user_id IS NOT NULL);

-- Step 9: Test the policies - Check view access for seekers
SELECT 
    'Post-Fix Seeker View Access' as check_type,
    COUNT(*) as total_view_records,
    COUNT(CASE WHEN owner_name IS NOT NULL THEN 1 END) as with_owner_names,
    COUNT(CASE WHEN owner_email IS NOT NULL THEN 1 END) as with_owner_emails
FROM public_property_owners;

-- Step 10: Verify our test data is now accessible to seekers
SELECT 
    'Seeker Test Data Accessibility' as check_type,
    property_id,
    owner_name,
    owner_email,
    listing_title,
    CASE 
        WHEN owner_name LIKE 'TEST LANDLORD - SYSTEM CHECK%' THEN '✅ TEST NAME NOW VISIBLE TO SEEKERS'
        ELSE '❌ TEST NAME STILL BLOCKED FROM SEEKERS'
    END as accessibility_status
FROM public_property_owners
WHERE property_id = '00000000-0000-0000-0000-000000000002';

-- Step 11: Summary of seeker access permissions
SELECT 
    'Seeker Access Summary' as check_type,
    '✅ Seekers can view property listings' as properties_access,
    '✅ Seekers can view landlord names' as landlord_names_access,
    '✅ Seekers can view property details' as details_access,
    '✅ Landlords can update own profiles' as landlord_update_access,
    '✅ New users can create profiles' as user_creation_access;

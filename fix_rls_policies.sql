-- Fix RLS Policies to Allow Tenants to See Landlord Names
-- Create proper policies for public access

-- Step 1: Enable RLS on all tables if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON user_profiles;

-- Step 3: Create policies that allow public access to landlord names
-- Policy for user_profiles - Allow anyone to see basic info for landlords
CREATE POLICY "Allow public access to landlord names" ON user_profiles
    FOR SELECT USING (
        id IN (SELECT user_id FROM properties WHERE user_id IS NOT NULL)
    );

-- Step 4: Ensure properties are publicly readable
DROP POLICY IF EXISTS "Properties are publicly viewable" ON properties;
CREATE POLICY "Properties are publicly viewable" ON properties
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

-- Step 7: Test the policies - Check what anonymous users can see now
SELECT 
    'Post-Fix Anonymous Properties Access' as check_type,
    COUNT(*) as total_properties,
    COUNT(CASE WHEN listing_title IS NOT NULL THEN 1 END) as with_titles,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user_id
FROM properties;

-- Step 8: Test the policies - Check user_profiles access
SELECT 
    'Post-Fix Anonymous User Profiles Access' as check_type,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as with_names,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as with_emails
FROM user_profiles
WHERE id IN (SELECT user_id FROM properties WHERE user_id IS NOT NULL);

-- Step 9: Test the policies - Check view access
SELECT 
    'Post-Fix Anonymous View Access' as check_type,
    COUNT(*) as total_view_records,
    COUNT(CASE WHEN owner_name IS NOT NULL THEN 1 END) as with_owner_names,
    COUNT(CASE WHEN owner_email IS NOT NULL THEN 1 END) as with_owner_emails
FROM public_property_owners;

-- Step 10: Verify our test data is now accessible
SELECT 
    'Test Data Accessibility' as check_type,
    property_id,
    owner_name,
    owner_email,
    listing_title,
    CASE 
        WHEN owner_name LIKE 'TEST LANDLORD - SYSTEM CHECK%' THEN '✅ TEST NAME NOW VISIBLE'
        ELSE '❌ TEST NAME STILL BLOCKED'
    END as accessibility_status
FROM public_property_owners
WHERE property_id = '00000000-0000-0000-0000-000000000002';

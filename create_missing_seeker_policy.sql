-- Check Current Policies and Create Missing Seeker Policy
-- Verify what exists and create the missing policy

-- Step 1: Check all current policies on user_profiles
SELECT 
    'Current user_profiles Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles'
AND schemaname = 'public'
ORDER BY policyname;

-- Step 2: Check if the seeker policy exists
SELECT 
    'Seeker Policy Check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'user_profiles' 
            AND schemaname = 'public'
            AND policyname = 'Allow seekers to view landlord names'
        ) THEN '✅ SEEKER POLICY EXISTS'
        ELSE '❌ SEEKER POLICY MISSING'
    END as seeker_policy_status;

-- Step 3: Create the missing seeker policy if it doesn't exist
CREATE POLICY IF NOT EXISTS "Allow seekers to view landlord names" ON user_profiles
    FOR SELECT USING (
        id IN (SELECT user_id FROM properties WHERE user_id IS NOT NULL)
    );

-- Step 4: Verify the policy was created
SELECT 
    'Policy Creation Verification' as check_type,
    policyname,
    cmd,
    qual,
    CASE 
        WHEN policyname = 'Allow seekers to view landlord names' THEN '✅ SEEKER POLICY CREATED'
        ELSE '📋 OTHER POLICY'
    END as policy_status
FROM pg_policies 
WHERE tablename = 'user_profiles'
AND schemaname = 'public'
ORDER BY policyname;

-- Step 5: Test if seekers can now access landlord names
SELECT 
    'Seeker Access Test' as check_type,
    COUNT(*) as total_landlord_profiles_accessible,
    COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as with_names,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as with_emails
FROM user_profiles
WHERE id IN (SELECT user_id FROM properties WHERE user_id IS NOT NULL);

-- Step 6: Test the view access
SELECT 
    'View Access Test' as check_type,
    COUNT(*) as total_view_records,
    COUNT(CASE WHEN owner_name IS NOT NULL THEN 1 END) as with_owner_names,
    COUNT(CASE WHEN owner_email IS NOT NULL THEN 1 END) as with_owner_emails
FROM public_property_owners;

-- Step 7: Show our test data specifically
SELECT 
    'Test Data Check' as check_type,
    property_id,
    owner_name,
    owner_email,
    listing_title,
    CASE 
        WHEN owner_name LIKE 'TEST LANDLORD - SYSTEM CHECK%' THEN '✅ TEST NAME ACCESSIBLE'
        ELSE '❌ TEST NAME NOT ACCESSIBLE'
    END as test_status
FROM public_property_owners
WHERE property_id = '00000000-0000-0000-0000-000000000002';

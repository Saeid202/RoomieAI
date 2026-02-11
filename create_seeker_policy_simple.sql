-- Create the Missing Seeker Policy
-- Simple version to create just the needed policy

-- Step 1: Create the seeker policy on user_profiles table
CREATE POLICY "Allow seekers to view landlord names" ON user_profiles
    FOR SELECT USING (
        id IN (SELECT user_id FROM properties WHERE user_id IS NOT NULL)
    );

-- Step 2: Verify the policy was created
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles'
AND schemaname = 'public'
AND policyname = 'Allow seekers to view landlord names';

-- Step 3: Test if seekers can access landlord names
SELECT 
    'Seeker Access Test' as check_type,
    COUNT(*) as total_landlord_profiles_accessible,
    COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as with_names
FROM user_profiles
WHERE id IN (SELECT user_id FROM properties WHERE user_id IS NOT NULL);

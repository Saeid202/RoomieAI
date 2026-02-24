-- ============================================
-- FINAL FIX: Mortgage Broker Consent Access
-- ============================================
-- This script ensures mortgage brokers can see profiles with broker_consent = true

-- Step 1: Verify RLS is enabled (should return true)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'mortgage_profiles';

-- Step 2: Drop existing SELECT policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own mortgage profile" ON mortgage_profiles;
DROP POLICY IF EXISTS "Anyone can view profiles with broker consent" ON mortgage_profiles;

-- Step 3: Recreate the user's own profile policy
CREATE POLICY "Users can view their own mortgage profile"
ON mortgage_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Step 4: Create the broker consent policy
CREATE POLICY "Anyone can view profiles with broker consent"
ON mortgage_profiles
FOR SELECT
USING (broker_consent = TRUE);

-- Step 5: Verify both policies exist
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'mortgage_profiles' AND cmd = 'SELECT'
ORDER BY policyname;

-- Step 6: Test the query (should return Saeid's profile)
SELECT 
    id,
    user_id,
    full_name,
    email,
    phone_number,
    broker_consent,
    broker_consent_date
FROM mortgage_profiles
WHERE broker_consent = true;

-- Step 7: Verify Saeid's consent is still true
SELECT 
    user_id,
    full_name,
    email,
    broker_consent,
    broker_consent_date
FROM mortgage_profiles
WHERE user_id = 'd599e69e-407f-44f4-899d-14a1e3af1103';

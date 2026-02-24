-- COMPREHENSIVE TEST: Verify broker can see consented profiles

-- 1. Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'mortgage_profiles';

-- 2. Check all RLS policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'mortgage_profiles'
ORDER BY policyname;

-- 3. Check Saeid's profile with consent
SELECT 
    id,
    user_id,
    full_name,
    email,
    broker_consent,
    broker_consent_date,
    created_at
FROM mortgage_profiles
WHERE user_id = 'd599e69e-407f-44f4-899d-14a1e3af1103';

-- 4. Test the query that the service uses (should return Saeid's profile)
SELECT 
    id,
    user_id,
    full_name,
    email,
    phone_number,
    credit_score_range,
    purchase_price_range,
    broker_consent,
    broker_consent_date
FROM mortgage_profiles
WHERE broker_consent = true
ORDER BY created_at DESC;

-- 5. Count total profiles with consent
SELECT COUNT(*) as consented_profiles
FROM mortgage_profiles
WHERE broker_consent = true;

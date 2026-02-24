-- Verify Broker Consent Filtering Logic
-- This script checks that the consent system is working correctly

-- 1. Check if broker_consent columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'mortgage_profiles'
  AND column_name IN ('broker_consent', 'broker_consent_date')
ORDER BY column_name;

-- 2. Check all mortgage profiles and their consent status
SELECT 
    id,
    user_id,
    full_name,
    email,
    broker_consent,
    broker_consent_date,
    created_at
FROM mortgage_profiles
ORDER BY created_at DESC;

-- 3. Check profiles WITH consent (what brokers will see)
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
WHERE broker_consent = TRUE
ORDER BY created_at DESC;

-- 4. Check profiles WITHOUT consent (what brokers will NOT see)
SELECT 
    id,
    user_id,
    full_name,
    email,
    broker_consent,
    broker_consent_date
FROM mortgage_profiles
WHERE broker_consent = FALSE OR broker_consent IS NULL
ORDER BY created_at DESC;

-- 5. Count profiles by consent status
SELECT 
    CASE 
        WHEN broker_consent = TRUE THEN 'Consented'
        WHEN broker_consent = FALSE THEN 'Not Consented'
        ELSE 'NULL (Not Set)'
    END as consent_status,
    COUNT(*) as count
FROM mortgage_profiles
GROUP BY broker_consent
ORDER BY consent_status;

-- 6. Check your specific profile
SELECT 
    id,
    user_id,
    full_name,
    email,
    broker_consent,
    broker_consent_date,
    created_at,
    updated_at
FROM mortgage_profiles
WHERE user_id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

-- Check if broker_consent column exists in mortgage_profiles table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'mortgage_profiles'
  AND column_name IN ('broker_consent', 'broker_consent_date')
ORDER BY column_name;

-- Also check your current profile data
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

-- First, ensure the columns exist (run the migration if not already done)
-- If columns don't exist, this will fail - run the migration first

-- Set broker_consent to TRUE for your user
UPDATE mortgage_profiles
SET 
    broker_consent = TRUE,
    broker_consent_date = NOW()
WHERE user_id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

-- Verify the update
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

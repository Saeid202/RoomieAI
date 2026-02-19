-- Check if tenant profile has documents
-- Replace 'USER_ID_HERE' with the actual applicant_id from the application

-- First, find the applicant_id from the application
SELECT 
    id as application_id,
    applicant_id,
    full_name,
    created_at
FROM rental_applications
WHERE full_name = 'Saeid Shabani'
ORDER BY created_at DESC
LIMIT 1;

-- Then check the tenant_profiles table for that user
-- (Replace the UUID below with the applicant_id from above)
SELECT 
    id,
    reference_letters,
    employment_letter,
    credit_score_report,
    additional_documents,
    monthly_income,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relationship
FROM tenant_profiles
WHERE id = 'REPLACE_WITH_APPLICANT_ID';

-- Also check if the user has a tenant_profiles record at all
SELECT COUNT(*) as profile_exists
FROM tenant_profiles
WHERE id = 'REPLACE_WITH_APPLICANT_ID';

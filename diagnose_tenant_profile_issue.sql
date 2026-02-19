-- Diagnostic query to find the tenant profile issue

-- Step 1: Find the application and applicant_id
SELECT 
    ra.id as application_id,
    ra.applicant_id,
    ra.full_name,
    ra.email
FROM rental_applications ra
WHERE ra.full_name = 'Saeid Shabani'
ORDER BY ra.created_at DESC
LIMIT 1;

-- Step 2: Check if tenant_profiles uses 'id' or 'user_id' as primary key
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tenant_profiles'
    AND table_schema = 'public'
    AND column_name IN ('id', 'user_id')
ORDER BY ordinal_position;

-- Step 3: Check if there's a tenant_profiles record for this user
-- (Replace UUID with the applicant_id from Step 1)
SELECT 
    *
FROM tenant_profiles
WHERE user_id = 'REPLACE_WITH_APPLICANT_ID_FROM_STEP_1';

-- Alternative: Check by id if user_id doesn't work
SELECT 
    *
FROM tenant_profiles
WHERE id = 'REPLACE_WITH_APPLICANT_ID_FROM_STEP_1';

-- Step 4: List all columns in tenant_profiles to see structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tenant_profiles'
    AND table_schema = 'public'
ORDER BY ordinal_position;

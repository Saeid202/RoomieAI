-- Create a Test Property with Known Data
-- This will help us confirm if the system is fetching data correctly

-- Step 1: Create a test user profile with a very specific name
INSERT INTO user_profiles (id, full_name, email, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'TEST LANDLORD - SYSTEM CHECK',
    'test@systemcheck.com',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    full_name = 'TEST LANDLORD - SYSTEM CHECK',
    updated_at = NOW();

-- Step 2: Create a test property linked to this user
INSERT INTO properties (
    id, 
    user_id, 
    listing_title, 
    property_type, 
    address, 
    city, 
    state, 
    zip_code, 
    monthly_rent, 
    bedrooms, 
    bathrooms, 
    description, 
    created_at, 
    updated_at,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'SYSTEM TEST PROPERTY - CHECK IF FETCHING WORKS',
    'rental',
    '123 Test Street',
    'Test City',
    'TS',
    '12345',
    1000,
    2,
    1,
    'This is a test property to verify system fetching',
    NOW(),
    NOW(),
    true
) ON CONFLICT (id) DO UPDATE SET
    listing_title = 'SYSTEM TEST PROPERTY - CHECK IF FETCHING WORKS',
    updated_at = NOW();

-- Step 3: Update the view to include our test data
DROP VIEW IF EXISTS public_property_owners;

CREATE VIEW public_property_owners AS
SELECT 
    p.id as property_id,
    p.user_id,
    up.full_name as owner_name,
    up.email as owner_email,
    p.listing_title,
    p.created_at as property_created_at
FROM properties p
LEFT JOIN user_profiles up ON p.user_id = up.id;

-- Step 4: Verify our test data is in the view
SELECT 
    'Test Data Verification' as check_type,
    property_id,
    owner_name,
    owner_email,
    listing_title,
    CASE 
        WHEN owner_name = 'TEST LANDLORD - SYSTEM CHECK' THEN '✅ TEST DATA READY'
        ELSE '❌ TEST DATA NOT READY'
    END as test_status
FROM public_property_owners
WHERE property_id = '00000000-0000-0000-0000-000000000002';

-- Step 5: Test the exact query the frontend would make for our test property
SELECT 
    'Frontend Query Simulation' as check_type,
    owner_name,
    owner_email,
    CASE 
        WHEN owner_name = 'TEST LANDLORD - SYSTEM CHECK' THEN '✅ FRONTEND SHOULD SEE THIS'
        ELSE '❌ FRONTEND QUERY FAILED'
    END as query_status
FROM public_property_owners
WHERE property_id = '00000000-0000-0000-0000-000000000002';

-- Step 6: Show all properties to see what the frontend will actually fetch
SELECT 
    'All Properties Frontend Will See' as check_type,
    property_id,
    listing_title,
    owner_name,
    CASE 
        WHEN listing_title LIKE 'SYSTEM TEST%' THEN '✅ OUR TEST PROPERTY'
        ELSE '📋 OTHER PROPERTY'
    END as property_type
FROM public_property_owners
ORDER BY property_created_at DESC;

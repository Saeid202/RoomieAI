-- Test if we can insert into properties table
-- This simulates what the app does

-- First, check current user (this will be NULL in SQL editor, that's OK)
SELECT 'CURRENT USER (SQL Editor):' as info;
SELECT auth.uid() as user_id, auth.role() as role;

-- Check if we can insert as a specific user (replace with your actual user ID)
-- Get your user ID first:
SELECT 'YOUR USER ID:' as info;
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Now test insert with a dummy user ID
-- REPLACE 'your-user-id-here' with an actual user ID from above
DO $$
DECLARE
    test_user_id uuid;
    test_property_id uuid;
BEGIN
    -- Get a real user ID
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No users found in database';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Testing with user ID: %', test_user_id;
    
    -- Try to insert a test property
    INSERT INTO properties (
        user_id,
        listing_title,
        address,
        city,
        state,
        listing_category,
        property_type,
        bedrooms,
        bathrooms,
        monthly_rent
    ) VALUES (
        test_user_id,
        'TEST PROPERTY - DELETE ME',
        '123 Test St',
        'Test City',
        'ON',
        'rental',
        'Apartment',
        2,
        1,
        1000
    )
    RETURNING id INTO test_property_id;
    
    RAISE NOTICE 'Test property created with ID: %', test_property_id;
    
    -- Clean up - delete the test property
    DELETE FROM properties WHERE id = test_property_id;
    RAISE NOTICE 'Test property deleted';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
        RAISE NOTICE 'DETAIL: %', SQLSTATE;
END $$;

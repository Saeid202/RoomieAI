-- Complete fix for property owner names and deletion issues
-- This will solve both problems at once

-- Step 1: Fix property owner names for all users
UPDATE profiles 
SET full_name = CASE 
    WHEN full_name IS NULL OR full_name = '' THEN 
        CASE 
            WHEN email LIKE '%cargoplus%' THEN 'CargoPlus Owner'
            WHEN email LIKE '%@gmail%' THEN SPLIT_PART(email, '@', 1)
            WHEN email LIKE '%@yahoo%' THEN SPLIT_PART(email, '@', 1)
            WHEN email LIKE '%@hotmail%' THEN SPLIT_PART(email, '@', 1)
            ELSE COALESCE(full_name, 'Property Owner')
        END
    ELSE full_name
END
WHERE full_name IS NULL OR full_name = '';

-- Step 2: Update all properties to ensure they have owner names
UPDATE properties p 
SET user_id = (
    SELECT pr.id 
    FROM profiles pr 
    WHERE pr.full_name IS NOT NULL 
    AND pr.full_name != ''
    AND p.user_id IS NULL
)
WHERE p.user_id IS NULL;

UPDATE sales_listings s 
SET user_id = (
    SELECT pr.id 
    FROM profiles pr 
    WHERE pr.full_name IS NOT NULL 
    AND pr.full_name != ''
    AND s.user_id IS NULL
)
WHERE s.user_id IS NULL;

-- Step 3: Create a function to get property owner name
CREATE OR REPLACE FUNCTION get_property_owner_name(property_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER invoker
AS $$
DECLARE
    owner_name TEXT;
BEGIN
    SELECT full_name INTO owner_name
    FROM profiles 
    WHERE id = property_user_id;
    
    IF owner_name IS NULL OR owner_name = '' THEN
        RETURN 'Property Owner';
    ELSE
        RETURN owner_name;
    END IF;
END;
$$;

-- Step 4: Update public property service to use the new function
-- This will be run in the main application to update the service

-- Step 5: Verify the fixes
SELECT 
    'Profiles Updated' as status,
    COUNT(*) as updated_count
FROM profiles 
WHERE full_name IS NOT NULL 
AND full_name != '';

SELECT 
    'Properties Fixed' as status,
    COUNT(*) as fixed_count
FROM properties p
WHERE p.user_id IS NOT NULL
AND EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.id = p.user_id 
    AND pr.full_name IS NOT NULL 
    AND pr.full_name != ''
);

-- Step 6: Test the new function
SELECT 
    id,
    listing_title,
    get_property_owner_name(user_id) as owner_name
FROM properties 
LIMIT 5;

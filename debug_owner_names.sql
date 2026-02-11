-- Test query to check property owner names
-- This will help debug why owner names might not be showing

-- Check a few rental properties and their owners
SELECT 
    p.id,
    p.listing_title,
    p.user_id,
    pr.full_name as owner_name,
    pr.email as owner_email
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id
WHERE p.is_active = true
LIMIT 5;

-- Check a few sales listings and their owners
SELECT 
    s.id,
    s.listing_title,
    s.user_id,
    pr.full_name as owner_name,
    pr.email as owner_email
FROM sales_listings s
LEFT JOIN profiles pr ON s.user_id = pr.id
WHERE s.is_active = true
LIMIT 5;

-- Check if profiles table has full_name data
SELECT 
    id,
    full_name,
    email,
    CASE 
        WHEN full_name IS NULL OR full_name = '' THEN 'Missing Name'
        ELSE 'Has Name'
    END as name_status
FROM profiles
LIMIT 10;

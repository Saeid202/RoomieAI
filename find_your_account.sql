-- Find your account and data
-- What's your email? Let me search for it

-- Search for accounts with similar emails
SELECT 'SEARCHING FOR YOUR ACCOUNT:' as info;
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email ILIKE '%shaba%' 
   OR email ILIKE '%roomie%'
   OR email ILIKE '%test%'
ORDER BY created_at DESC;

-- Check if you have any properties
SELECT 'YOUR PROPERTIES:' as info;
SELECT 
    p.id,
    p.listing_title,
    p.address,
    p.city,
    p.created_at,
    u.email as owner_email
FROM properties p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.email ILIKE '%shaba%' 
   OR u.email ILIKE '%roomie%'
   OR u.email ILIKE '%test%'
ORDER BY p.created_at DESC;

-- Check all properties in the system
SELECT 'ALL PROPERTIES IN SYSTEM:' as info;
SELECT 
    COUNT(*) as total_properties,
    COUNT(DISTINCT user_id) as unique_owners
FROM properties;

-- Show recent properties
SELECT 'RECENT PROPERTIES:' as info;
SELECT 
    p.id,
    p.listing_title,
    p.address,
    p.city,
    p.created_at,
    u.email as owner_email
FROM properties p
LEFT JOIN auth.users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

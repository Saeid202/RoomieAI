-- Test to see current property data and owner information
-- This will help us understand why names aren't showing correctly

-- Check rental properties with owner info
SELECT 
    p.id as property_id,
    p.listing_title,
    p.user_id as lister_id,
    pr.full_name as lister_name,
    pr.email as lister_email,
    -- Check if there's a separate property_owner field in properties table
    CASE 
        WHEN p.property_owner IS NOT NULL THEN 'Has property_owner field'
        ELSE 'No property_owner field'
    END as has_property_owner_field
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id
WHERE p.is_active = true
LIMIT 3;

-- Check sales listings with owner info
SELECT 
    s.id as property_id,
    s.listing_title,
    s.user_id as lister_id,
    pr.full_name as lister_name,
    pr.email as lister_email,
    -- Check if there's a separate property_owner field in sales_listings table
    CASE 
        WHEN s.property_owner IS NOT NULL THEN 'Has property_owner field'
        ELSE 'No property_owner field'
    END as has_property_owner_field
FROM sales_listings s
LEFT JOIN profiles pr ON s.user_id = pr.id
WHERE s.is_active = true
LIMIT 3;

-- Check what columns exist in properties table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'properties' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what columns exist in sales_listings table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sales_listings' AND table_schema = 'public'
ORDER BY ordinal_position;

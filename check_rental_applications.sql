-- Check if rental_applications table exists and its structure
-- This script helps debug the foreign key constraint issue

-- 1. Check if the table exists
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'rental_applications' 
AND table_schema = 'public';

-- 2. If table exists, show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'rental_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'rental_applications' OR ccu.table_name = 'properties');

-- 4. Check if there are any rental applications for properties
SELECT 
    ra.id,
    ra.property_id,
    ra.full_name,
    ra.status,
    p.listing_title
FROM rental_applications ra
JOIN properties p ON ra.property_id = p.id
LIMIT 10;

-- 5. Check specific property (Pet Plaza) for applications
SELECT 
    ra.id,
    ra.property_id,
    ra.full_name,
    ra.status,
    p.listing_title
FROM rental_applications ra
JOIN properties p ON ra.property_id = p.id
WHERE p.listing_title ILIKE '%pet%' OR p.listing_title ILIKE '%plaza%';

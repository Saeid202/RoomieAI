-- Check the current foreign key constraint for rental_applications
-- This will help us understand why CASCADE delete isn't working

-- 1. Check the current foreign key constraint
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
AND tc.table_name = 'rental_applications'
AND tc.table_schema = 'public';

-- 2. Check if there are any rental applications for properties
SELECT 
    ra.id,
    ra.property_id,
    ra.full_name,
    ra.status,
    p.listing_title
FROM rental_applications ra
JOIN properties p ON ra.property_id = p.id
LIMIT 10;

-- 3. Check specific property (Pet Plaza) for applications
SELECT 
    ra.id,
    ra.property_id,
    ra.full_name,
    ra.status,
    p.listing_title
FROM rental_applications ra
JOIN properties p ON ra.property_id = p.id
WHERE p.listing_title ILIKE '%pet%' OR p.listing_title ILIKE '%plaza%';

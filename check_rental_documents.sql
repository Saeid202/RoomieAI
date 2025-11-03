-- Check the rental_documents table and its foreign key constraints
-- This will help us understand the cascade chain

-- 1. Check if rental_documents table exists
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'rental_documents' 
AND table_schema = 'public';

-- 2. Check the structure of rental_documents table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'rental_documents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check foreign key constraints for rental_documents
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
AND tc.table_name = 'rental_documents'
AND tc.table_schema = 'public';

-- 4. Check if there are any rental documents
SELECT COUNT(*) as document_count FROM rental_documents;

-- 5. Check documents for specific applications
SELECT 
    rd.id,
    rd.application_id,
    rd.document_type,
    rd.document_url,
    ra.full_name,
    p.listing_title
FROM rental_documents rd
JOIN rental_applications ra ON rd.application_id = ra.id
JOIN properties p ON ra.property_id = p.id
LIMIT 10;

-- Check rental_documents table data and structure
-- This will help us understand why documents aren't visible

-- 1. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'rental_documents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if there are any documents in the table
SELECT COUNT(*) as total_documents FROM rental_documents;

-- 3. Show recent documents with application details
SELECT 
    rd.id,
    rd.application_id,
    rd.document_type,
    rd.original_filename,
    rd.status,
    rd.created_at,
    ra.full_name as applicant_name,
    p.listing_title as property_name,
    p.user_id as landlord_id
FROM rental_documents rd
LEFT JOIN rental_applications ra ON rd.application_id = ra.id
LEFT JOIN properties p ON ra.property_id = p.id
ORDER BY rd.created_at DESC
LIMIT 10;

-- 4. Check current user (for RLS testing)
SELECT auth.uid() as current_user_id;

-- 5. Test RLS policy - check if current user can see documents
SELECT 
    rd.id,
    rd.document_type,
    rd.original_filename,
    ra.full_name,
    p.listing_title
FROM rental_documents rd
JOIN rental_applications ra ON rd.application_id = ra.id
JOIN properties p ON ra.property_id = p.id
WHERE p.user_id = auth.uid()
LIMIT 5;

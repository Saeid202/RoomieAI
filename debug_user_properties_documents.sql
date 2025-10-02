-- Debug user properties and document associations
-- This will help us understand why documents aren't visible

-- 1. Check current user ID
SELECT auth.uid() as current_user_id;

-- 2. Check if current user owns any properties
SELECT 
    id,
    listing_title,
    user_id,
    created_at
FROM properties 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- 3. Check if there are any rental applications for current user's properties
SELECT 
    ra.id as application_id,
    ra.full_name as applicant_name,
    ra.status,
    ra.created_at as application_date,
    p.id as property_id,
    p.listing_title,
    p.user_id as landlord_id
FROM rental_applications ra
JOIN properties p ON ra.property_id = p.id
WHERE p.user_id = auth.uid()
ORDER BY ra.created_at DESC;

-- 4. Check if there are any documents for current user's properties
SELECT 
    rd.id as document_id,
    rd.document_type,
    rd.original_filename,
    rd.status,
    rd.created_at as document_date,
    ra.id as application_id,
    ra.full_name as applicant_name,
    p.id as property_id,
    p.listing_title,
    p.user_id as landlord_id
FROM rental_documents rd
JOIN rental_applications ra ON rd.application_id = ra.id
JOIN properties p ON ra.property_id = p.id
WHERE p.user_id = auth.uid()
ORDER BY rd.created_at DESC;

-- 5. Check all documents in the system (for debugging)
SELECT 
    rd.id,
    rd.document_type,
    rd.original_filename,
    rd.status,
    rd.created_at,
    ra.full_name as applicant_name,
    p.listing_title as property_name,
    p.user_id as property_owner_id
FROM rental_documents rd
LEFT JOIN rental_applications ra ON rd.application_id = ra.id
LEFT JOIN properties p ON ra.property_id = p.id
ORDER BY rd.created_at DESC
LIMIT 10;

-- 6. Check if there are any properties at all
SELECT COUNT(*) as total_properties FROM properties;

-- 7. Check if there are any rental applications at all
SELECT COUNT(*) as total_applications FROM rental_applications;

-- 8. Check if there are any documents at all
SELECT COUNT(*) as total_documents FROM rental_documents;

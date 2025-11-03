-- Comprehensive debug for document visibility issue
-- This will help us understand the complete data flow

-- 1. Check current user
SELECT 
    'Current User Info' as section,
    auth.uid() as user_id,
    auth.email() as user_email;

-- 2. Check if user owns any properties
SELECT 
    'User Properties' as section,
    COUNT(*) as property_count
FROM properties 
WHERE user_id = auth.uid();

-- 3. Show user's properties
SELECT 
    'User Properties Details' as section,
    id,
    listing_title,
    user_id,
    created_at
FROM properties 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- 4. Check applications for user's properties
SELECT 
    'Applications for User Properties' as section,
    COUNT(*) as application_count
FROM rental_applications ra
JOIN properties p ON ra.property_id = p.id
WHERE p.user_id = auth.uid();

-- 5. Show applications for user's properties
SELECT 
    'Application Details' as section,
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

-- 6. Check documents for user's properties
SELECT 
    'Documents for User Properties' as section,
    COUNT(*) as document_count
FROM rental_documents rd
JOIN rental_applications ra ON rd.application_id = ra.id
JOIN properties p ON ra.property_id = p.id
WHERE p.user_id = auth.uid();

-- 7. Show documents for user's properties
SELECT 
    'Document Details' as section,
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

-- 8. Show ALL documents in system (for debugging)
SELECT 
    'All Documents in System' as section,
    rd.id as document_id,
    rd.document_type,
    rd.original_filename,
    rd.status,
    rd.created_at as document_date,
    ra.id as application_id,
    ra.full_name as applicant_name,
    p.id as property_id,
    p.listing_title,
    p.user_id as property_owner_id
FROM rental_documents rd
LEFT JOIN rental_applications ra ON rd.application_id = ra.id
LEFT JOIN properties p ON ra.property_id = p.id
ORDER BY rd.created_at DESC
LIMIT 10;

-- 9. Check RLS policies
SELECT 
    'Current RLS Policies' as section,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'rental_documents' 
AND schemaname = 'public';

-- 10. Test RLS policy directly
SELECT 
    'RLS Policy Test' as section,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM rental_documents rd
            JOIN rental_applications ra ON rd.application_id = ra.id
            JOIN properties p ON ra.property_id = p.id
            WHERE p.user_id = auth.uid()
        ) THEN 'PASS - User can see documents'
        ELSE 'FAIL - User cannot see documents'
    END as rls_test_result;

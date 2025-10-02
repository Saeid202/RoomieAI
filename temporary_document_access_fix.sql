-- Temporary fix to allow document access for debugging
-- This will temporarily disable RLS to test document visibility

-- 1. Temporarily disable RLS on rental_documents table
ALTER TABLE public.rental_documents DISABLE ROW LEVEL SECURITY;

-- 2. Test if documents are now visible
SELECT 
    'Documents visible after disabling RLS' as test_description,
    COUNT(*) as document_count
FROM rental_documents;

-- 3. Show all documents
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

-- 4. Check current user
SELECT 
    'Current User' as info,
    auth.uid() as user_id,
    auth.email() as user_email;

-- 5. Check if user owns any properties
SELECT 
    'User Properties' as info,
    COUNT(*) as property_count
FROM properties 
WHERE user_id = auth.uid();

-- 6. Show user's properties
SELECT 
    'Property Details' as info,
    id,
    listing_title,
    user_id,
    created_at
FROM properties 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

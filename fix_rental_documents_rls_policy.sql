-- Fix RLS policy for rental_documents to allow landlords to see documents
-- This will make documents visible on the landlord side

-- 1. Drop the existing restrictive policy
DROP POLICY IF EXISTS "Landlords can view documents for their properties" ON public.rental_documents;

-- 2. Create a more permissive policy for landlords
CREATE POLICY "Landlords can view documents for their properties" ON public.rental_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rental_applications ra
      JOIN public.properties p ON ra.property_id = p.id
      WHERE ra.id = rental_documents.application_id
      AND p.user_id = auth.uid()
    )
  );

-- 3. Also allow applicants to view their own documents
CREATE POLICY "Applicants can view their own documents" ON public.rental_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rental_applications ra
      WHERE ra.id = rental_documents.application_id
      AND ra.applicant_id = auth.uid()
    )
  );

-- 4. Allow document uploads (for applicants)
CREATE POLICY "Applicants can upload documents" ON public.rental_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rental_applications ra
      WHERE ra.id = rental_documents.application_id
      AND ra.applicant_id = auth.uid()
    )
  );

-- 5. Test the policy - check if current user can see documents
SELECT 
    rd.id,
    rd.document_type,
    rd.original_filename,
    rd.status,
    ra.full_name as applicant_name,
    p.listing_title as property_name,
    p.user_id as property_owner_id,
    auth.uid() as current_user_id
FROM rental_documents rd
JOIN rental_applications ra ON rd.application_id = ra.id
JOIN properties p ON ra.property_id = p.id
WHERE p.user_id = auth.uid()
ORDER BY rd.created_at DESC
LIMIT 10;

-- 6. Show all documents for debugging
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

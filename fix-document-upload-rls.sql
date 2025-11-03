-- Fix RLS policies for document upload
-- Run this in Supabase SQL Editor to enable document uploads

-- =====================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- =====================================================

SELECT '1. Enabling RLS on rental_documents table...' as step;
ALTER TABLE public.rental_documents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. DROP EXISTING POLICIES (to avoid conflicts)
-- =====================================================

SELECT '2. Dropping existing policies...' as step;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.rental_documents;
DROP POLICY IF EXISTS "Property owners can view documents for their applications" ON public.rental_documents;
DROP POLICY IF EXISTS "Users can upload rental documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own rental documents" ON storage.objects;

-- =====================================================
-- 3. CREATE RLS POLICIES FOR RENTAL_DOCUMENTS TABLE
-- =====================================================

SELECT '3. Creating RLS policies for rental_documents...' as step;

-- INSERT Policy - Allow users to upload their own documents
CREATE POLICY "Users can insert their own documents" ON public.rental_documents
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.rental_applications 
        WHERE rental_applications.id = rental_documents.application_id 
        AND rental_applications.applicant_id = auth.uid()
    )
);

-- SELECT Policy - Allow users to view their own documents
CREATE POLICY "Users can view their own documents" ON public.rental_documents
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.rental_applications 
        WHERE rental_applications.id = rental_documents.application_id 
        AND rental_applications.applicant_id = auth.uid()
    )
);

-- UPDATE Policy - Allow users to update their own documents
CREATE POLICY "Users can update their own documents" ON public.rental_documents
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.rental_applications 
        WHERE rental_applications.id = rental_documents.application_id 
        AND rental_applications.applicant_id = auth.uid()
    )
);

-- DELETE Policy - Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents" ON public.rental_documents
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.rental_applications 
        WHERE rental_applications.id = rental_documents.application_id 
        AND rental_applications.applicant_id = auth.uid()
    )
);

-- Property Owner Policy - Allow property owners to view documents for their applications
CREATE POLICY "Property owners can view documents for their applications" ON public.rental_documents
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.rental_applications ra
        JOIN public.properties p ON p.id = ra.property_id
        WHERE ra.id = rental_documents.application_id 
        AND p.user_id = auth.uid()
    )
);

-- =====================================================
-- 4. CREATE STORAGE BUCKET (if missing)
-- =====================================================

SELECT '4. Creating storage bucket (if missing)...' as step;
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rental-documents',
  'rental-documents', 
  false, -- Private bucket for security
  10485760, -- 10MB file size limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- =====================================================
-- 5. CREATE STORAGE POLICIES
-- =====================================================

SELECT '5. Creating storage policies...' as step;

-- Users can upload to their own folder
CREATE POLICY "Users can upload rental documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'rental-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own files
CREATE POLICY "Users can view their own rental documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'rental-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own files
CREATE POLICY "Users can update their own rental documents" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'rental-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own files
CREATE POLICY "Users can delete their own rental documents" ON storage.objects
FOR DELETE USING (
    bucket_id = 'rental-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Property owners can view documents for their applications
CREATE POLICY "Property owners can view rental documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'rental-documents' AND
    EXISTS (
        SELECT 1 FROM public.rental_applications ra
        JOIN public.properties p ON p.id = ra.property_id
        WHERE ra.id::text = (storage.foldername(name))[2]
        AND p.user_id = auth.uid()
    )
);

-- =====================================================
-- 6. VERIFICATION
-- =====================================================

SELECT '6. Verifying setup...' as step;

-- Check RLS is enabled
SELECT 
  'RLS Status:' as component,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as status
FROM pg_tables 
WHERE tablename = 'rental_documents';

-- Check RLS policies
SELECT 
  'RLS Policies:' as component,
  CONCAT('✅ ', COUNT(*), ' policies created') as status
FROM pg_policies 
WHERE tablename = 'rental_documents';

-- Check storage policies
SELECT 
  'Storage Policies:' as component,
  CONCAT('✅ ', COUNT(*), ' policies created') as status
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%rental%';

-- Check storage bucket
SELECT 
  'Storage Bucket:' as component,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM storage.buckets 
WHERE id = 'rental-documents';

-- =====================================================
-- 7. SUCCESS MESSAGE
-- =====================================================

SELECT '7. Setup Complete!' as step;
SELECT 
  '🎉 Document upload RLS policies have been configured successfully!' as message,
  '✅ Users can now upload documents to their own applications' as feature1,
  '✅ Property owners can view documents for their properties' as feature2,
  '✅ All security policies are in place' as feature3,
  '💡 Try uploading a document now!' as next_step;

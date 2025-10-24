-- Complete verification script for rental documents system
-- Run this in Supabase SQL Editor to check all components

-- =====================================================
-- 1. VERIFY STORAGE BUCKET CONFIGURATION
-- =====================================================

-- Check if rental-documents bucket exists
SELECT '1. Checking storage bucket...' as step;
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'rental-documents';

-- Check storage objects (uploaded files)
SELECT '2. Checking uploaded files...' as step;
SELECT 
  COUNT(*) as total_files,
  bucket_id
FROM storage.objects 
WHERE bucket_id = 'rental-documents'
GROUP BY bucket_id;

-- Check storage policies
SELECT '3. Checking storage policies...' as step;
SELECT 
  policyname, 
  cmd, 
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%rental%';

-- =====================================================
-- 2. VERIFY DATABASE TABLE CONFIGURATION
-- =====================================================

-- Check if rental_documents table exists
SELECT '4. Checking database table...' as step;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'rental_documents';

-- Check table structure
SELECT '5. Checking table structure...' as step;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'rental_documents'
ORDER BY ordinal_position;

-- =====================================================
-- 3. VERIFY RLS POLICIES
-- =====================================================

-- Check rental_documents table RLS policies
SELECT '6. Checking RLS policies...' as step;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'rental_documents'
ORDER BY cmd;

-- =====================================================
-- 4. VERIFY DATA IN DATABASE
-- =====================================================

-- Check if any documents exist
SELECT '7. Checking document records...' as step;
SELECT 
  COUNT(*) as total_documents,
  document_type,
  status
FROM rental_documents
GROUP BY document_type, status;

-- Check recent document uploads
SELECT '8. Checking recent uploads...' as step;
SELECT 
  id,
  application_id,
  document_type,
  original_filename,
  file_size_bytes,
  status,
  created_at
FROM rental_documents
ORDER BY created_at DESC
LIMIT 10;

-- Check documents by application
SELECT '9. Checking documents by application...' as step;
SELECT 
  ra.id as application_id,
  ra.full_name,
  ra.status as application_status,
  COUNT(rd.id) as document_count
FROM rental_applications ra
LEFT JOIN rental_documents rd ON rd.application_id = ra.id
GROUP BY ra.id, ra.full_name, ra.status
ORDER BY ra.created_at DESC
LIMIT 10;

-- =====================================================
-- 5. SUMMARY
-- =====================================================

SELECT '10. Verification complete!' as step;
SELECT 
  'Check the results above to verify:' as instruction,
  '1. Storage bucket exists and is configured' as check1,
  '2. Database table exists with correct structure' as check2,
  '3. RLS policies are properly set up' as check3,
  '4. Documents are being saved to database' as check4;

-- Check RLS status for rental_documents table
-- Run this in Supabase SQL Editor to diagnose RLS issues

-- =====================================================
-- 1. CHECK IF RLS IS ENABLED
-- =====================================================

SELECT '1. Checking RLS status...' as step;
SELECT 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS Enabled'
    ELSE '❌ RLS Disabled - This is the problem!'
  END as rls_status
FROM pg_tables 
WHERE tablename = 'rental_documents';

-- =====================================================
-- 2. CHECK EXISTING RLS POLICIES
-- =====================================================

SELECT '2. Checking existing RLS policies...' as step;
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN CONCAT('✅ ', COUNT(*), ' policies found')
    ELSE '❌ No RLS policies - This is the problem!'
  END as policy_status,
  policyname, 
  cmd, 
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'rental_documents'
GROUP BY policyname, cmd, roles, qual, with_check
ORDER BY cmd;

-- =====================================================
-- 3. CHECK STORAGE POLICIES
-- =====================================================

SELECT '3. Checking storage policies...' as step;
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN CONCAT('✅ ', COUNT(*), ' storage policies found')
    ELSE '❌ No storage policies - This could be a problem!'
  END as storage_policy_status,
  policyname, 
  cmd, 
  roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%rental%'
GROUP BY policyname, cmd, roles;

-- =====================================================
-- 4. CHECK STORAGE BUCKET
-- =====================================================

SELECT '4. Checking storage bucket...' as step;
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Bucket exists'
    ELSE '❌ Bucket missing'
  END as bucket_status,
  id, 
  name, 
  public, 
  file_size_limit
FROM storage.buckets 
WHERE id = 'rental-documents';

-- =====================================================
-- 5. CHECK RECENT DOCUMENT ATTEMPTS
-- =====================================================

SELECT '5. Checking for document records...' as step;
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN CONCAT('✅ ', COUNT(*), ' documents found')
    ELSE '❌ No documents in database - Uploads are failing!'
  END as document_status,
  COUNT(*) as total_documents,
  document_type,
  status
FROM rental_documents
GROUP BY document_type, status;

-- =====================================================
-- 6. DIAGNOSTIC SUMMARY
-- =====================================================

SELECT '6. Diagnostic Summary' as step;

WITH diagnostics AS (
  SELECT 
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'rental_documents') as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'rental_documents') as rls_policies,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%rental%') as storage_policies,
    (SELECT COUNT(*) FROM storage.buckets WHERE id = 'rental-documents') as bucket_exists,
    (SELECT COUNT(*) FROM rental_documents) as documents_exist
)
SELECT 
  CASE 
    WHEN rls_enabled = false THEN '❌ RLS NOT ENABLED - This is the main issue!'
    WHEN rls_policies = 0 THEN '❌ NO RLS POLICIES - This is the main issue!'
    WHEN storage_policies = 0 THEN '⚠️ NO STORAGE POLICIES - This could cause issues!'
    WHEN bucket_exists = 0 THEN '❌ NO STORAGE BUCKET - This is an issue!'
    WHEN documents_exist = 0 THEN '❌ NO DOCUMENTS SAVED - Uploads are failing!'
    ELSE '✅ All components configured'
  END as overall_diagnosis,
  rls_enabled,
  rls_policies,
  storage_policies,
  bucket_exists,
  documents_exist
FROM diagnostics;

-- =====================================================
-- 7. RECOMMENDED ACTION
-- =====================================================

SELECT '7. Recommended Action' as step;

SELECT 
  CASE 
    WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'rental_documents') = false 
    THEN '🔧 URGENT: Enable RLS and create policies - run fix-document-upload-rls.sql'
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'rental_documents') = 0 
    THEN '🔧 URGENT: Create RLS policies - run fix-document-upload-rls.sql'
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%rental%') = 0 
    THEN '🔧 Create storage policies - run fix-document-upload-rls.sql'
    WHEN (SELECT COUNT(*) FROM storage.buckets WHERE id = 'rental-documents') = 0 
    THEN '🔧 Create storage bucket - run fix-rental-documents-complete.sql'
    ELSE '✅ All components configured - check browser console for other errors'
  END as recommended_action;

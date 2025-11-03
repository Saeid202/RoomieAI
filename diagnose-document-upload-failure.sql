-- Comprehensive diagnostic script for document upload failures
-- Run this in Supabase SQL Editor to identify why documents aren't being saved

-- =====================================================
-- 1. CHECK STORAGE BUCKET CONFIGURATION
-- =====================================================

SELECT '1. Checking storage bucket configuration...' as step;

-- Check if rental-documents bucket exists
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Bucket exists'
    ELSE '❌ Bucket missing'
  END as bucket_status,
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'rental-documents';

-- Check storage objects (uploaded files)
SELECT '2. Checking uploaded files in storage...' as step;
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN CONCAT('✅ ', COUNT(*), ' files found')
    ELSE '❌ No files in storage'
  END as storage_status,
  bucket_id,
  COUNT(*) as file_count
FROM storage.objects 
WHERE bucket_id = 'rental-documents'
GROUP BY bucket_id;

-- Check storage policies
SELECT '3. Checking storage policies...' as step;
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN CONCAT('✅ ', COUNT(*), ' policies found')
    ELSE '❌ No storage policies'
  END as policy_status,
  policyname, 
  cmd, 
  roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%rental%';

-- =====================================================
-- 2. CHECK DATABASE TABLE CONFIGURATION
-- =====================================================

SELECT '4. Checking database table...' as step;

-- Check if rental_documents table exists
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Table exists'
    ELSE '❌ Table missing'
  END as table_status,
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
-- 3. CHECK RLS POLICIES
-- =====================================================

-- Check rental_documents table RLS policies
SELECT '6. Checking database RLS policies...' as step;
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN CONCAT('✅ ', COUNT(*), ' policies found')
    ELSE '❌ No RLS policies'
  END as rls_status,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'rental_documents'
ORDER BY cmd;

-- =====================================================
-- 4. CHECK DATA IN DATABASE
-- =====================================================

-- Check if any documents exist
SELECT '7. Checking document records...' as step;
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN CONCAT('✅ ', COUNT(*), ' documents found')
    ELSE '❌ No documents in database'
  END as data_status,
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

-- Check applications with documents
SELECT '9. Checking applications with documents...' as step;
SELECT 
  ra.id as application_id,
  ra.full_name,
  ra.status as application_status,
  COUNT(rd.id) as document_count,
  ra.created_at as application_created
FROM rental_applications ra
LEFT JOIN rental_documents rd ON rd.application_id = ra.id
GROUP BY ra.id, ra.full_name, ra.status, ra.created_at
ORDER BY ra.created_at DESC
LIMIT 10;

-- =====================================================
-- 5. CHECK FOR COMMON ISSUES
-- =====================================================

SELECT '10. Checking for common issues...' as step;

-- Check if foreign key constraint exists
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Foreign key exists'
    ELSE '❌ Foreign key missing'
  END as fk_status,
  constraint_name,
  table_name,
  column_name
FROM information_schema.key_column_usage 
WHERE table_name = 'rental_documents' 
AND constraint_name LIKE '%fkey%';

-- Check for recent application submissions
SELECT '11. Checking recent applications...' as step;
SELECT 
  COUNT(*) as recent_applications,
  MAX(created_at) as latest_application
FROM rental_applications 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- =====================================================
-- 6. DIAGNOSTIC SUMMARY
-- =====================================================

SELECT '12. Diagnostic Summary' as step;

WITH diagnostics AS (
  SELECT 
    (SELECT COUNT(*) FROM storage.buckets WHERE id = 'rental-documents') as bucket_exists,
    (SELECT COUNT(*) FROM storage.objects WHERE bucket_id = 'rental-documents') as files_in_storage,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'rental_documents') as table_exists,
    (SELECT COUNT(*) FROM rental_documents) as documents_in_db,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'rental_documents') as rls_policies,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%rental%') as storage_policies
)
SELECT 
  CASE 
    WHEN bucket_exists = 0 THEN '❌ Storage bucket missing'
    WHEN files_in_storage = 0 THEN '❌ No files in storage'
    WHEN table_exists = 0 THEN '❌ Database table missing'
    WHEN documents_in_db = 0 THEN '❌ No documents in database'
    WHEN rls_policies = 0 THEN '❌ No RLS policies'
    WHEN storage_policies = 0 THEN '❌ No storage policies'
    ELSE '✅ All components exist'
  END as overall_status,
  bucket_exists,
  files_in_storage,
  table_exists,
  documents_in_db,
  rls_policies,
  storage_policies
FROM diagnostics;

-- =====================================================
-- 7. RECOMMENDED FIXES
-- =====================================================

SELECT '13. Recommended fixes based on results:' as step;

-- This will show different recommendations based on what's missing
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM storage.buckets WHERE id = 'rental-documents') = 0 
    THEN '🔧 Run: fix-rental-documents-complete.sql to create storage bucket'
    WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'rental_documents') = 0 
    THEN '🔧 Run: fix-rental-documents-complete.sql to create database table'
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'rental_documents') = 0 
    THEN '🔧 Run: fix-rental-documents-complete.sql to create RLS policies'
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%rental%') = 0 
    THEN '🔧 Run: fix-rental-documents-complete.sql to create storage policies'
    ELSE '✅ All components configured - check browser console for upload errors'
  END as recommended_action;

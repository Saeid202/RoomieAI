-- =====================================================
-- Check Edge Function Setup
-- =====================================================
-- This checks if everything is configured correctly

-- 1. Check if Gemini API key is set
SELECT 
  'API Key Status' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'GEMINI_API_KEY') 
    THEN '✅ API Key is set'
    ELSE '❌ API Key is MISSING - Run: supabase secrets set GEMINI_API_KEY=AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0'
  END as status;

-- 2. Check document processing status
SELECT 
  'Processing Status' as check_name,
  pd.document_type,
  pd.file_name,
  ps.status,
  ps.error_message,
  ps.retry_count,
  ps.started_at,
  ps.completed_at
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
  AND pd.deleted_at IS NULL
ORDER BY pd.updated_at DESC;

-- 3. Check embeddings count
SELECT 
  'Embeddings Count' as check_name,
  COUNT(*) as total_embeddings,
  COUNT(DISTINCT document_id) as documents_with_embeddings,
  COUNT(DISTINCT document_type) as document_types_processed
FROM property_document_embeddings
WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f';

-- 4. Check file types (JPEGs and PNGs won't work with simple PDF parser)
SELECT 
  'File Types' as check_name,
  document_type,
  file_name,
  CASE 
    WHEN file_name ILIKE '%.pdf' THEN '✅ PDF - Should work'
    WHEN file_name ILIKE '%.jpeg' OR file_name ILIKE '%.jpg' THEN '⚠️ JPEG - Needs OCR'
    WHEN file_name ILIKE '%.png' THEN '⚠️ PNG - Needs OCR'
    ELSE '❓ Unknown type'
  END as file_type_status
FROM property_documents
WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
  AND deleted_at IS NULL
ORDER BY file_name;

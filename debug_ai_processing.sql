-- =====================================================
-- Debug AI Document Processing
-- =====================================================

-- 1. Check if documents exist
SELECT 
  '1. Documents in property_documents table' as check_name,
  id,
  property_id,
  document_type,
  file_name,
  updated_at
FROM property_documents
WHERE deleted_at IS NULL
ORDER BY updated_at DESC
LIMIT 5;

-- 2. Check processing status records
SELECT 
  '2. Processing status records' as check_name,
  id,
  document_id,
  property_id,
  status,
  total_chunks,
  processed_chunks,
  error_message,
  created_at,
  started_at,
  completed_at
FROM property_document_processing_status
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check if any embeddings were created
SELECT 
  '3. Embeddings created' as check_name,
  COUNT(*) as total_embeddings,
  COUNT(DISTINCT document_id) as documents_with_embeddings,
  COUNT(DISTINCT property_id) as properties_with_embeddings
FROM property_document_embeddings;

-- 4. Check for specific property (replace with your property ID)
-- Get the most recent property with documents
WITH recent_property AS (
  SELECT property_id 
  FROM property_documents 
  WHERE deleted_at IS NULL 
  ORDER BY updated_at DESC 
  LIMIT 1
)
SELECT 
  '4. Status for most recent property' as check_name,
  pd.id as document_id,
  pd.document_type,
  pd.file_name,
  COALESCE(ps.status, 'NO STATUS RECORD') as processing_status,
  ps.error_message,
  CASE 
    WHEN ps.id IS NULL THEN '❌ No processing status created'
    WHEN ps.status = 'pending' THEN '⏳ Waiting to process'
    WHEN ps.status = 'processing' THEN '🔄 Currently processing'
    WHEN ps.status = 'completed' THEN '✅ Completed'
    WHEN ps.status = 'failed' THEN '❌ Failed'
  END as status_emoji
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.property_id IN (SELECT property_id FROM recent_property)
  AND pd.deleted_at IS NULL
ORDER BY pd.updated_at DESC;

-- 5. Check Edge Function logs (if accessible)
SELECT 
  '5. Recent AI conversations' as check_name,
  COUNT(*) as total_conversations,
  MAX(created_at) as last_conversation
FROM ai_property_conversations;

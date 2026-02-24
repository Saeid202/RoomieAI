-- =====================================================
-- Verify Gemini Embeddings
-- =====================================================
-- Run these queries in Supabase SQL Editor after processing
-- =====================================================

-- 1. Check embeddings (should show 2000 dimensions)
SELECT 
  id,
  document_type,
  document_category,
  chunk_index,
  array_length(embedding::float[], 1) as dimensions,
  substring(content, 1, 100) as content_preview,
  created_at
FROM property_document_embeddings
WHERE document_id = '8a22e588-590e-4a59-93c9-d0a5e59af009'
ORDER BY chunk_index
LIMIT 10;

-- Expected: dimensions = 2000

-- 2. Check processing status
SELECT 
  document_id,
  property_id,
  status,
  total_chunks,
  processed_chunks,
  error_message,
  started_at,
  completed_at,
  retry_count
FROM property_document_processing_status
WHERE document_id = '8a22e588-590e-4a59-93c9-d0a5e59af009';

-- Expected: status = 'completed', no error_message

-- 3. Count total embeddings for this document
SELECT 
  COUNT(*) as total_chunks,
  document_type,
  document_category
FROM property_document_embeddings
WHERE document_id = '8a22e588-590e-4a59-93c9-d0a5e59af009'
GROUP BY document_type, document_category;

-- 4. Verify index exists (should show IVFFlat)
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'property_document_embeddings'
  AND indexname = 'idx_embeddings_vector';

-- Expected: indexdef contains 'ivfflat'

-- 5. Test search function (should work with 2000 dimensions)
-- First, get a sample embedding to test with
DO $$
DECLARE
  test_embedding vector(2000);
BEGIN
  -- Get first embedding as test
  SELECT embedding INTO test_embedding
  FROM property_document_embeddings
  WHERE document_id = '8a22e588-590e-4a59-93c9-d0a5e59af009'
  LIMIT 1;
  
  -- Test search function
  RAISE NOTICE 'Testing search function...';
  
  PERFORM * FROM search_property_documents(
    'db8e5787-a221-4381-a148-9aa360b474a4'::uuid,
    test_embedding,
    0.5,
    5
  );
  
  RAISE NOTICE 'Search function works! ✅';
END $$;

-- 6. Check all documents for this property
SELECT 
  pd.id,
  pd.document_type,
  pd.file_url,
  ps.status,
  ps.total_chunks,
  ps.error_message
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
  AND pd.deleted_at IS NULL
ORDER BY pd.uploaded_at DESC;

-- 7. Summary statistics
SELECT 
  'Total Documents' as metric,
  COUNT(DISTINCT document_id)::text as value
FROM property_document_embeddings
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'

UNION ALL

SELECT 
  'Total Chunks' as metric,
  COUNT(*)::text as value
FROM property_document_embeddings
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'

UNION ALL

SELECT 
  'Avg Chunks per Doc' as metric,
  ROUND(AVG(chunk_count))::text as value
FROM (
  SELECT COUNT(*) as chunk_count
  FROM property_document_embeddings
  WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
  GROUP BY document_id
) sub;

-- =====================================================
-- Migrate to Gemini Embeddings (2000 dimensions)
-- =====================================================
-- Purpose: Update vector dimensions for Gemini compatibility
-- Model: gemini-embedding-001 (returns 3072, truncated to 2000)
-- Note: Using IVFFlat index (HNSW max is 2000 dimensions)
-- =====================================================

-- Drop existing vector index (will be recreated with new dimensions)
DROP INDEX IF EXISTS idx_embeddings_vector;

-- Delete all existing embeddings (they're test data anyway)
DELETE FROM property_document_embeddings;

-- Alter the embedding column to use 2000 dimensions (Gemini truncated)
ALTER TABLE property_document_embeddings 
  DROP COLUMN IF EXISTS embedding;

ALTER TABLE property_document_embeddings 
  ADD COLUMN embedding vector(2000) NOT NULL;

-- Recreate the vector similarity search index using IVFFlat
-- IVFFlat supports more dimensions than HNSW (which maxes at 2000)
CREATE INDEX idx_embeddings_vector 
  ON property_document_embeddings 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Update the search function to use 2000 dimensions
DROP FUNCTION IF EXISTS search_property_documents(UUID, vector(1536), FLOAT, INTEGER);
DROP FUNCTION IF EXISTS search_property_documents(UUID, vector(768), FLOAT, INTEGER);
DROP FUNCTION IF EXISTS search_property_documents(UUID, vector(2000), FLOAT, INTEGER);

CREATE OR REPLACE FUNCTION search_property_documents(
  p_property_id UUID,
  p_query_embedding vector(2000),
  p_match_threshold FLOAT DEFAULT 0.7,
  p_match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  document_type TEXT,
  document_category TEXT,
  content TEXT,
  page_number INTEGER,
  section_title TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pde.id,
    pde.document_id,
    pde.document_type,
    pde.document_category,
    pde.content,
    pde.page_number,
    pde.section_title,
    1 - (pde.embedding <=> p_query_embedding) AS similarity
  FROM property_document_embeddings pde
  WHERE pde.property_id = p_property_id
    AND 1 - (pde.embedding <=> p_query_embedding) > p_match_threshold
  ORDER BY pde.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$;

-- Reset all processing statuses to pending (so they can be reprocessed)
UPDATE property_document_processing_status
SET 
  status = 'pending',
  error_message = 'Migrated to Gemini - needs reprocessing',
  started_at = NULL,
  completed_at = NULL,
  total_chunks = 0,
  processed_chunks = 0,
  updated_at = NOW()
WHERE status IN ('completed', 'failed');

COMMENT ON TABLE property_document_embeddings IS 
  'Stores vector embeddings of property document chunks for RAG-based AI assistant (Gemini gemini-embedding-001, 3072 dimensions truncated to 2000)';

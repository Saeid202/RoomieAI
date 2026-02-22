-- =====================================================
-- Update Embeddings for Gemini API
-- =====================================================
-- Purpose: Change vector dimensions from 1536 to 768
--          for Google Gemini text-embedding-004 model
-- =====================================================

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing index
DROP INDEX IF EXISTS property_document_embeddings_embedding_idx;

-- Drop existing table (if you want to start fresh)
-- WARNING: This will delete all existing embeddings!
-- Comment out if you want to keep existing data
DROP TABLE IF EXISTS property_document_embeddings CASCADE;

-- Recreate table with 768 dimensions
CREATE TABLE IF NOT EXISTS property_document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES property_documents(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_category TEXT NOT NULL,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(768), -- Changed from 1536 to 768 for Gemini
  page_number INTEGER,
  section_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create HNSW index for fast similarity search
CREATE INDEX property_document_embeddings_embedding_idx 
ON property_document_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- Create indexes for filtering
CREATE INDEX property_document_embeddings_property_id_idx 
ON property_document_embeddings(property_id);

CREATE INDEX property_document_embeddings_document_id_idx 
ON property_document_embeddings(document_id);

-- Enable RLS
ALTER TABLE property_document_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role can manage embeddings"
ON property_document_embeddings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Update the search function to use 768 dimensions
CREATE OR REPLACE FUNCTION search_property_documents(
  p_property_id UUID,
  p_query_embedding vector(768), -- Changed from 1536 to 768
  p_match_threshold FLOAT DEFAULT 0.7,
  p_match_count INT DEFAULT 5
)
RETURNS TABLE (
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_property_documents TO service_role;

COMMENT ON TABLE property_document_embeddings IS 'Stores vector embeddings of property documents for RAG-based AI assistant (Gemini 768-dim)';
COMMENT ON FUNCTION search_property_documents IS 'Searches for relevant document chunks using vector similarity (Gemini 768-dim)';

-- =====================================================
-- AI Property Assistant - Vector Storage Setup
-- =====================================================
-- Purpose: Enable RAG (Retrieval-Augmented Generation)
--          for property document Q&A system
-- =====================================================

-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- Document Embeddings Table
-- =====================================================
-- Stores text chunks from property documents with vector embeddings
CREATE TABLE IF NOT EXISTS property_document_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Link to source document
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES property_documents(id) ON DELETE CASCADE,
  
  -- Document metadata
  document_type TEXT NOT NULL,
  document_category TEXT NOT NULL CHECK (document_category IN ('Legal Identity', 'Property Condition', 'Governance')),
  
  -- Text content
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL, -- Order of chunk in document
  
  -- Vector embedding (1536 dimensions for OpenAI text-embedding-3-small)
  embedding vector(1536) NOT NULL,
  
  -- Metadata for citation
  page_number INTEGER,
  section_title TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique chunks per document
  UNIQUE(document_id, chunk_index)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Vector similarity search index (HNSW for fast approximate nearest neighbor)
CREATE INDEX IF NOT EXISTS idx_embeddings_vector 
  ON property_document_embeddings 
  USING hnsw (embedding vector_cosine_ops);

-- Property lookup index
CREATE INDEX IF NOT EXISTS idx_embeddings_property 
  ON property_document_embeddings(property_id);

-- Document lookup index
CREATE INDEX IF NOT EXISTS idx_embeddings_document 
  ON property_document_embeddings(document_id);

-- Document type filter index
CREATE INDEX IF NOT EXISTS idx_embeddings_type 
  ON property_document_embeddings(document_type);

-- Category filter index
CREATE INDEX IF NOT EXISTS idx_embeddings_category 
  ON property_document_embeddings(document_category);

-- =====================================================
-- AI Conversation History Table
-- =====================================================
-- Stores buyer-AI conversations for context and audit
CREATE TABLE IF NOT EXISTS ai_property_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Context
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Conversation
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  
  -- Citations (JSON array of document references)
  citations JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  response_time_ms INTEGER, -- How long AI took to respond
  tokens_used INTEGER, -- Token count for cost tracking
  model_used TEXT DEFAULT 'gpt-4o-mini',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Indexes for Conversation History
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_conversations_property 
  ON ai_property_conversations(property_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user 
  ON ai_property_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_created 
  ON ai_property_conversations(created_at DESC);

-- =====================================================
-- Document Processing Status Table
-- =====================================================
-- Track which documents have been processed for embeddings
CREATE TABLE IF NOT EXISTS property_document_processing_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  document_id UUID NOT NULL REFERENCES property_documents(id) ON DELETE CASCADE UNIQUE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Processing status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Stats
  total_chunks INTEGER DEFAULT 0,
  processed_chunks INTEGER DEFAULT 0,
  
  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Indexes for Processing Status
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_processing_status_document 
  ON property_document_processing_status(document_id);

CREATE INDEX IF NOT EXISTS idx_processing_status_property 
  ON property_document_processing_status(property_id);

CREATE INDEX IF NOT EXISTS idx_processing_status_status 
  ON property_document_processing_status(status);

-- =====================================================
-- RLS Policies
-- =====================================================

-- Enable RLS
ALTER TABLE property_document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_property_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_document_processing_status ENABLE ROW LEVEL SECURITY;

-- Embeddings: Only accessible by system (Edge Functions)
-- Users don't directly query embeddings - they go through AI assistant
CREATE POLICY "Service role can manage embeddings"
  ON property_document_embeddings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Conversations: Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON ai_property_conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Conversations: Users can create conversations
CREATE POLICY "Users can create conversations"
  ON ai_property_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Property owners can view all conversations about their property
CREATE POLICY "Property owners can view property conversations"
  ON ai_property_conversations
  FOR SELECT
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid()
    )
  );

-- Processing Status: Service role only
CREATE POLICY "Service role can manage processing status"
  ON property_document_processing_status
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Property owners can view processing status of their documents
CREATE POLICY "Property owners can view processing status"
  ON property_document_processing_status
  FOR SELECT
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid()
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to search similar document chunks
CREATE OR REPLACE FUNCTION search_property_documents(
  p_property_id UUID,
  p_query_embedding vector(1536),
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

-- Function to get conversation history for a property
CREATE OR REPLACE FUNCTION get_property_conversation_history(
  p_property_id UUID,
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  user_message TEXT,
  ai_response TEXT,
  citations JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    apc.id,
    apc.user_message,
    apc.ai_response,
    apc.citations,
    apc.created_at
  FROM ai_property_conversations apc
  WHERE apc.property_id = p_property_id
    AND apc.user_id = p_user_id
  ORDER BY apc.created_at DESC
  LIMIT p_limit;
END;
$$;

-- =====================================================
-- Triggers
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_embeddings_updated_at
  BEFORE UPDATE ON property_document_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processing_status_updated_at
  BEFORE UPDATE ON property_document_processing_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE property_document_embeddings IS 
  'Stores vector embeddings of property document chunks for RAG-based AI assistant';

COMMENT ON TABLE ai_property_conversations IS 
  'Stores buyer-AI conversation history for context and audit trail';

COMMENT ON TABLE property_document_processing_status IS 
  'Tracks document processing status for embedding generation';

COMMENT ON FUNCTION search_property_documents IS 
  'Performs vector similarity search to find relevant document chunks for a query';

COMMENT ON FUNCTION get_property_conversation_history IS 
  'Retrieves conversation history between a user and the AI assistant for a property';

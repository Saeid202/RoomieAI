-- =====================================================
-- AI Property Assistant - Safe Migration Fix
-- =====================================================
-- Purpose: Create missing tables and policies safely
--          (checks if they exist first)
-- =====================================================

-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- Document Embeddings Table
-- =====================================================
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
  chunk_index INTEGER NOT NULL,
  
  -- Vector embedding (768 dimensions for Gemini)
  embedding vector(768) NOT NULL,
  
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
-- AI Conversation History Table
-- =====================================================
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
  response_time_ms INTEGER,
  tokens_used INTEGER,
  model_used TEXT DEFAULT 'gemini-1.5-flash',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Document Processing Status Table
-- =====================================================
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
-- Indexes for Performance
-- =====================================================

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_embeddings_vector 
  ON property_document_embeddings 
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_embeddings_property 
  ON property_document_embeddings(property_id);

CREATE INDEX IF NOT EXISTS idx_embeddings_document 
  ON property_document_embeddings(document_id);

CREATE INDEX IF NOT EXISTS idx_embeddings_type 
  ON property_document_embeddings(document_type);

CREATE INDEX IF NOT EXISTS idx_embeddings_category 
  ON property_document_embeddings(document_category);

-- Conversation indexes
CREATE INDEX IF NOT EXISTS idx_conversations_property 
  ON ai_property_conversations(property_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user 
  ON ai_property_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_created 
  ON ai_property_conversations(created_at DESC);

-- Processing status indexes
CREATE INDEX IF NOT EXISTS idx_processing_status_document 
  ON property_document_processing_status(document_id);

CREATE INDEX IF NOT EXISTS idx_processing_status_property 
  ON property_document_processing_status(property_id);

CREATE INDEX IF NOT EXISTS idx_processing_status_status 
  ON property_document_processing_status(status);

-- =====================================================
-- RLS Policies (Drop existing first to avoid conflicts)
-- =====================================================

-- Enable RLS
ALTER TABLE property_document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_property_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_document_processing_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage embeddings" ON property_document_embeddings;
DROP POLICY IF EXISTS "Users can view own conversations" ON ai_property_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON ai_property_conversations;
DROP POLICY IF EXISTS "Property owners can view property conversations" ON ai_property_conversations;
DROP POLICY IF EXISTS "Service role can manage processing status" ON property_document_processing_status;
DROP POLICY IF EXISTS "Property owners can view processing status" ON property_document_processing_status;

-- Recreate policies
CREATE POLICY "Service role can manage embeddings"
  ON property_document_embeddings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own conversations"
  ON ai_property_conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
  ON ai_property_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Property owners can view property conversations"
  ON ai_property_conversations
  FOR SELECT
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage processing status"
  ON property_document_processing_status
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Property owners can view processing status"
  ON property_document_processing_status
  FOR SELECT
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Drop existing functions first
DROP FUNCTION IF EXISTS search_property_documents(UUID, vector(768), FLOAT, INTEGER);
DROP FUNCTION IF EXISTS get_property_conversation_history(UUID, UUID, INTEGER);

-- Function to search similar document chunks
CREATE OR REPLACE FUNCTION search_property_documents(
  p_property_id UUID,
  p_query_embedding vector(768),
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

-- Function to get conversation history
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

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_embeddings_updated_at ON property_document_embeddings;
DROP TRIGGER IF EXISTS update_processing_status_updated_at ON property_document_processing_status;

-- Create update function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_embeddings_updated_at
  BEFORE UPDATE ON property_document_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processing_status_updated_at
  BEFORE UPDATE ON property_document_processing_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Verification
-- =====================================================

-- Check that all tables exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_document_embeddings') THEN
    RAISE EXCEPTION 'Table property_document_embeddings was not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ai_property_conversations') THEN
    RAISE EXCEPTION 'Table ai_property_conversations was not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_document_processing_status') THEN
    RAISE EXCEPTION 'Table property_document_processing_status was not created';
  END IF;
  
  RAISE NOTICE '✅ All AI Property Assistant tables created successfully!';
END $$;

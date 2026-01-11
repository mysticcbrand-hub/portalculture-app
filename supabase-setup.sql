-- ============================================
-- PORTAL CULTURE AI COACH - DATABASE SETUP
-- ============================================

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- TABLE 1: knowledge_base
-- Stores all knowledge chunks with embeddings
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  source VARCHAR(255) NOT NULL, -- 'atomic_habits', 'charisma_myth', 'huberman_lab', etc.
  source_type VARCHAR(50) NOT NULL, -- 'pdf', 'web'
  metadata JSONB DEFAULT '{}', -- page numbers, url, title, etc.
  embedding vector(1536), -- OpenAI ada-002 or similar embedding dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for vector similarity search (CRITICAL for performance)
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx ON knowledge_base 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for filtering by source
CREATE INDEX IF NOT EXISTS knowledge_base_source_idx ON knowledge_base(source);

-- ============================================
-- TABLE 2: chat_messages
-- Stores conversation history
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  context_used JSONB DEFAULT '[]', -- Array of knowledge_base IDs used for this response
  tokens_used INTEGER DEFAULT 0,
  model VARCHAR(100) DEFAULT 'google/gemini-2.0-flash-exp:free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for querying chat history efficiently
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at DESC);

-- ============================================
-- TABLE 3: chat_usage
-- Tracks daily usage per user for rate limiting
-- ============================================
CREATE TABLE IF NOT EXISTS chat_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Index for quick daily lookups
CREATE INDEX IF NOT EXISTS chat_usage_user_date_idx ON chat_usage(user_id, date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_usage ENABLE ROW LEVEL SECURITY;

-- knowledge_base: Read-only for authenticated users
CREATE POLICY "Allow authenticated users to read knowledge_base"
  ON knowledge_base FOR SELECT
  TO authenticated
  USING (true);

-- chat_messages: Users can only see their own messages
CREATE POLICY "Users can view their own messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- chat_usage: Users can only see their own usage
CREATE POLICY "Users can view their own usage"
  ON chat_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON chat_usage FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON chat_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTION: Vector similarity search
-- ============================================
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  source varchar,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_base.id,
    knowledge_base.content,
    knowledge_base.source,
    knowledge_base.metadata,
    1 - (knowledge_base.embedding <=> query_embedding) AS similarity
  FROM knowledge_base
  WHERE 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_base.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- HELPER FUNCTION: Update or increment chat usage
-- ============================================
CREATE OR REPLACE FUNCTION increment_chat_usage(
  p_user_id UUID,
  p_message_count INTEGER DEFAULT 1,
  p_tokens_used INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO chat_usage (user_id, date, message_count, tokens_used)
  VALUES (p_user_id, CURRENT_DATE, p_message_count, p_tokens_used)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    message_count = chat_usage.message_count + p_message_count,
    tokens_used = chat_usage.tokens_used + p_tokens_used,
    updated_at = NOW();
END;
$$;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE knowledge_base IS 'Stores AI coach knowledge from PDFs and web sources with vector embeddings';
COMMENT ON TABLE chat_messages IS 'Conversation history between users and AI coach';
COMMENT ON TABLE chat_usage IS 'Daily usage tracking for rate limiting (20 messages/user/day)';
COMMENT ON FUNCTION match_knowledge IS 'Performs vector similarity search to find relevant knowledge chunks';
COMMENT ON FUNCTION increment_chat_usage IS 'Atomically increments daily usage counters for a user';

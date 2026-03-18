-- Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table for storing document chunks and their embeddings
CREATE TABLE public.knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(768), -- 768 dimensions for Gemini Embedding 004 / v2 preview
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own knowledge chunks"
  ON public.knowledge_chunks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own knowledge chunks"
  ON public.knowledge_chunks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge chunks"
  ON public.knowledge_chunks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create HNSW index for faster similarity search
CREATE INDEX ON public.knowledge_chunks USING hnsw (embedding vector_cosine_ops);

-- Function to search for chunks by semantic similarity
CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT,
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.document_id,
    kc.content,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  WHERE kc.user_id = p_user_id
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add a processing_status column to knowledge_documents if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_documents' AND column_name = 'processing_status') THEN
    ALTER TABLE public.knowledge_documents ADD COLUMN processing_status TEXT DEFAULT 'pending';
  END IF;
END $$;

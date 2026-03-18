-- Create knowledge_documents table for storing user's knowledge base documents
CREATE TABLE public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  content_summary TEXT,
  extracted_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies - Users can only manage their own documents
CREATE POLICY "Users can view their own documents"
  ON public.knowledge_documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON public.knowledge_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.knowledge_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster user queries
CREATE INDEX idx_knowledge_documents_user_id ON public.knowledge_documents(user_id);

-- Comment on table
COMMENT ON TABLE public.knowledge_documents IS 'Stores metadata and extracted content from user uploaded documents for AI knowledge base';
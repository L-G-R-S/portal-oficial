-- Create chat_messages table for conversation persistence
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_id UUID,
  entity_type TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_chat_messages_user_entity ON public.chat_messages(user_id, entity_id, entity_type);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own messages
CREATE POLICY "Users can view their own chat messages"
  ON public.chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert their own chat messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own chat messages"
  ON public.chat_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create chat-uploads storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-uploads', 'chat-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat uploads
CREATE POLICY "Users can upload their own chat files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'chat-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own chat files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'chat-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own chat files"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'chat-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
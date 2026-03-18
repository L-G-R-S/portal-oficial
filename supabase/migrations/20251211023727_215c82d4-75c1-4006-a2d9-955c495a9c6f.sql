-- Add update_type column to update_logs
ALTER TABLE public.update_logs 
ADD COLUMN IF NOT EXISTS update_type text DEFAULT 'full';

-- Add comment for documentation
COMMENT ON COLUMN public.update_logs.update_type IS 'Type of update: full, content_news, or news_only';
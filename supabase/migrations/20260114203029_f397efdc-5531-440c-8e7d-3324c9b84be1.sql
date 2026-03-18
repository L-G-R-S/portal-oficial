-- Add new columns to success_cases
ALTER TABLE public.success_cases 
ADD COLUMN IF NOT EXISTS published_by TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_video_case BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT NULL;

-- Migrate existing data
UPDATE public.success_cases SET published_by = 'SAP' WHERE is_sap_published = true AND published_by IS NULL;

-- Create table for custom categories
CREATE TABLE IF NOT EXISTS public.case_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-gray-500',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS on case_categories
ALTER TABLE public.case_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for case_categories
CREATE POLICY "Users can view their own categories" 
ON public.case_categories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" 
ON public.case_categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
ON public.case_categories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
ON public.case_categories 
FOR DELETE 
USING (auth.uid() = user_id);
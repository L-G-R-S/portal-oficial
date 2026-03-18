-- Create function to update timestamps if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create success_cases table
CREATE TABLE public.success_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_logo_url TEXT,
  case_title TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  challenges JSONB NOT NULL DEFAULT '[]',
  solutions JSONB NOT NULL DEFAULT '[]',
  results JSONB NOT NULL DEFAULT '[]',
  is_sap_published BOOLEAN DEFAULT false,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.success_cases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cases"
ON public.success_cases
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cases"
ON public.success_cases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cases"
ON public.success_cases
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cases"
ON public.success_cases
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_success_cases_updated_at
BEFORE UPDATE ON public.success_cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for case assets
INSERT INTO storage.buckets (id, name, public) VALUES ('case-assets', 'case-assets', true);

-- Storage policies for case-assets bucket
CREATE POLICY "Users can upload case assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'case-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Case assets are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'case-assets');

CREATE POLICY "Users can update their case assets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'case-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their case assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'case-assets' AND auth.role() = 'authenticated');
CREATE TABLE IF NOT EXISTS public.system_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL UNIQUE,
    api_key TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Only super admins can view and edit
CREATE POLICY "Super admins can manage api keys" 
ON public.system_api_keys
FOR ALL
USING (
  auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'super_admin')
)
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'super_admin')
);

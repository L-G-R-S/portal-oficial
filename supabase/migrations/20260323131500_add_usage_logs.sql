CREATE TABLE IF NOT EXISTS public.user_usage_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text,
  action_type text NOT NULL,
  page_path text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_usage_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can insert their own usage logs" 
ON public.user_usage_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage logs" 
ON public.user_usage_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all usage logs" 
ON public.user_usage_logs 
FOR SELECT 
USING (public.is_super_admin(auth.uid()));

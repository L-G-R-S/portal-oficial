-- Create analysis_activity_log table for detailed per-entity logs
CREATE TABLE public.analysis_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  batch_log_id uuid REFERENCES public.update_logs(id) ON DELETE SET NULL,
  entity_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_name text,
  entity_domain text,
  trigger_type text NOT NULL DEFAULT 'manual',
  update_type text NOT NULL DEFAULT 'full',
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_seconds integer,
  error_message text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT analysis_activity_log_entity_type_check CHECK (entity_type IN ('competitor', 'prospect', 'client', 'primary')),
  CONSTRAINT analysis_activity_log_trigger_type_check CHECK (trigger_type IN ('manual', 'automatic', 'manual_single')),
  CONSTRAINT analysis_activity_log_update_type_check CHECK (update_type IN ('full', 'content_news', 'news_only')),
  CONSTRAINT analysis_activity_log_status_check CHECK (status IN ('pending', 'running', 'success', 'failed', 'timeout'))
);

-- Add trigger_type to update_logs
ALTER TABLE public.update_logs ADD COLUMN IF NOT EXISTS trigger_type text DEFAULT 'manual';

-- Create indexes for better query performance
CREATE INDEX idx_analysis_activity_log_user_id ON public.analysis_activity_log(user_id);
CREATE INDEX idx_analysis_activity_log_created_at ON public.analysis_activity_log(created_at DESC);
CREATE INDEX idx_analysis_activity_log_entity_type ON public.analysis_activity_log(entity_type);
CREATE INDEX idx_analysis_activity_log_status ON public.analysis_activity_log(status);

-- Enable RLS
ALTER TABLE public.analysis_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only see their own logs
CREATE POLICY "Users can view their own activity logs"
  ON public.analysis_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
  ON public.analysis_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage activity logs"
  ON public.analysis_activity_log FOR ALL
  USING (true)
  WITH CHECK (true);
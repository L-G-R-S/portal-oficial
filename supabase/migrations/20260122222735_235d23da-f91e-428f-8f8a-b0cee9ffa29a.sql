-- Create email_subscribers table
CREATE TABLE public.email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  receive_instant_alerts BOOLEAN DEFAULT true,
  receive_weekly_digest BOOLEAN DEFAULT true,
  entities_filter JSONB DEFAULT '{"competitors": true, "prospects": true, "clients": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT email_subscribers_email_key UNIQUE (email)
);

-- Create indexes
CREATE INDEX idx_email_subscribers_active ON email_subscribers(is_active);
CREATE INDEX idx_email_subscribers_user ON email_subscribers(user_id);

-- Enable RLS
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Super Admin has full access
CREATE POLICY "Super admin full access on email_subscribers" ON email_subscribers
  FOR ALL USING (public.is_super_admin());

-- Users can manage their own subscription
CREATE POLICY "Users manage own email subscription" ON email_subscribers
  FOR ALL USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_email_subscribers_updated_at
  BEFORE UPDATE ON email_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create email_logs table for tracking sent emails
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES email_subscribers(id) ON DELETE CASCADE,
  email_to TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_type TEXT NOT NULL,
  entity_type TEXT,
  entity_name TEXT,
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Only Super Admin can view logs
CREATE POLICY "Super admin can view email_logs" ON email_logs
  FOR SELECT USING (public.is_super_admin());

-- Super Admin can insert logs (for edge functions)
CREATE POLICY "Super admin can insert email_logs" ON email_logs
  FOR INSERT WITH CHECK (true);

-- Add receive_email_updates column to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS receive_email_updates BOOLEAN DEFAULT false;
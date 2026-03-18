-- Create email_alert_settings table for managing email frequency and preferences
CREATE TABLE public.email_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  frequency_type TEXT DEFAULT 'weekly' CHECK (frequency_type IN ('instant', 'daily', 'weekly', 'monthly')),
  frequency_day INTEGER DEFAULT 1 CHECK (frequency_day >= 1 AND frequency_day <= 31),
  frequency_hour INTEGER DEFAULT 9 CHECK (frequency_hour >= 0 AND frequency_hour <= 23),
  only_high_impact BOOLEAN DEFAULT true,
  last_digest_at TIMESTAMPTZ,
  next_digest_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_alert_settings ENABLE ROW LEVEL SECURITY;

-- Super admin can manage all settings
CREATE POLICY "Super admin full access on email_alert_settings"
  ON public.email_alert_settings
  FOR ALL
  USING (public.is_super_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_email_alert_settings_updated_at
  BEFORE UPDATE ON public.email_alert_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
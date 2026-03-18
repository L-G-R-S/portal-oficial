-- Create table to track excluded news from email digests
CREATE TABLE public.excluded_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL,
  news_table TEXT NOT NULL CHECK (news_table IN ('market_news', 'prospect_market_news', 'client_market_news')),
  excluded_at TIMESTAMPTZ DEFAULT now(),
  excluded_by UUID REFERENCES auth.users(id),
  reason TEXT,
  UNIQUE(news_id, news_table)
);

-- Enable RLS
ALTER TABLE public.excluded_news ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage excluded news
CREATE POLICY "Super admins can view excluded news"
ON public.excluded_news FOR SELECT
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert excluded news"
ON public.excluded_news FOR INSERT
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete excluded news"
ON public.excluded_news FOR DELETE
USING (public.is_super_admin(auth.uid()));

-- Add index for faster lookups
CREATE INDEX idx_excluded_news_lookup ON public.excluded_news(news_id, news_table);
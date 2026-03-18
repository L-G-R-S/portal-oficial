-- Tabela principal para empresa do usuário
CREATE TABLE public.primary_company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  name TEXT,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  industry TEXT,
  sector TEXT,
  website TEXT,
  headquarters TEXT,
  employee_count INTEGER,
  year_founded INTEGER,
  tagline TEXT,
  business_model TEXT,
  market TEXT,
  size TEXT,
  type TEXT,
  phone TEXT,
  address TEXT,
  linkedin_url TEXT,
  linkedin_followers INTEGER,
  linkedin_tagline TEXT,
  linkedin_industry TEXT,
  linkedin_specialties TEXT[],
  instagram_url TEXT,
  instagram_followers INTEGER,
  instagram_username TEXT,
  instagram_bio TEXT,
  instagram_profile_picture TEXT,
  instagram_posts_count INTEGER,
  youtube_url TEXT,
  youtube_subscribers INTEGER,
  youtube_channel_name TEXT,
  youtube_total_videos INTEGER,
  youtube_total_views INTEGER,
  tiktok_url TEXT,
  all_locations JSONB DEFAULT '[]'::jsonb,
  products_services JSONB DEFAULT '[]'::jsonb,
  differentiators JSONB DEFAULT '[]'::jsonb,
  partners JSONB DEFAULT '[]'::jsonb,
  clients JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela Glassdoor para empresa principal
CREATE TABLE public.primary_company_glassdoor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_company_id UUID REFERENCES public.primary_company(id) ON DELETE CASCADE,
  overall_rating NUMERIC,
  ceo_rating NUMERIC,
  recommend_to_friend NUMERIC,
  culture_values_rating NUMERIC,
  work_life_balance_rating NUMERIC,
  career_opportunities_rating NUMERIC,
  compensation_benefits_rating NUMERIC,
  diversity_inclusion_rating NUMERIC,
  pros_example TEXT,
  cons_example TEXT,
  advice_example TEXT,
  reviews JSONB DEFAULT '[]'::jsonb,
  salaries JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  interviews JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela Market Research para empresa principal
CREATE TABLE public.primary_company_market_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_company_id UUID REFERENCES public.primary_company(id) ON DELETE CASCADE,
  website_url TEXT,
  blog_url TEXT,
  central_message TEXT,
  topics_discussed TEXT,
  curiosities TEXT,
  source_references TEXT,
  overall_analysis TEXT,
  institutional_discourse TEXT,
  positioning_discourse TEXT,
  recurring_topics JSONB DEFAULT '[]'::jsonb,
  digital_presence JSONB,
  strategic_analysis JSONB,
  swot_analysis JSONB,
  public_actions JSONB,
  events JSONB DEFAULT '[]'::jsonb,
  institutional_materials JSONB DEFAULT '[]'::jsonb,
  institutional_curiosities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela Market News para empresa principal
CREATE TABLE public.primary_company_market_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_company_id UUID REFERENCES public.primary_company(id) ON DELETE CASCADE,
  title TEXT,
  url TEXT,
  date TIMESTAMP WITH TIME ZONE,
  summary TEXT,
  classification TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela Leadership para empresa principal
CREATE TABLE public.primary_company_leadership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_company_id UUID REFERENCES public.primary_company(id) ON DELETE CASCADE,
  name TEXT,
  position TEXT,
  linkedin_url TEXT,
  decision_level TEXT,
  relevance_score NUMERIC,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela LinkedIn Posts para empresa principal
CREATE TABLE public.primary_company_linkedin_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_company_id UUID REFERENCES public.primary_company(id) ON DELETE CASCADE,
  external_id TEXT,
  text TEXT,
  post_type TEXT,
  media_type TEXT,
  media_url TEXT,
  media_thumbnail TEXT,
  media_duration_ms INTEGER,
  posted_at TIMESTAMP WITH TIME ZONE,
  total_reactions INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  loves INTEGER DEFAULT 0,
  celebrates INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela Instagram Posts para empresa principal
CREATE TABLE public.primary_company_instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_company_id UUID REFERENCES public.primary_company(id) ON DELETE CASCADE,
  external_id TEXT,
  caption TEXT,
  url TEXT,
  media_type TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  hashtags TEXT,
  mentions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela YouTube Videos para empresa principal
CREATE TABLE public.primary_company_youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_company_id UUID REFERENCES public.primary_company(id) ON DELETE CASCADE,
  external_id TEXT,
  title TEXT,
  url TEXT,
  thumbnail_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela Similar Companies para empresa principal
CREATE TABLE public.primary_company_similar_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_company_id UUID REFERENCES public.primary_company(id) ON DELETE CASCADE,
  name TEXT,
  url TEXT,
  logo_url TEXT,
  industry TEXT,
  location TEXT,
  source TEXT DEFAULT 'linkedin_similar',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.primary_company ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_company_glassdoor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_company_market_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_company_market_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_company_leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_company_linkedin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_company_instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_company_youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_company_similar_companies ENABLE ROW LEVEL SECURITY;

-- RLS Policies para primary_company (usuário só vê/edita sua própria empresa)
CREATE POLICY "Users can view their own primary company"
  ON public.primary_company FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own primary company"
  ON public.primary_company FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own primary company"
  ON public.primary_company FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own primary company"
  ON public.primary_company FOR DELETE
  USING (auth.uid() = user_id);

-- Função helper para verificar se usuário é dono da primary_company
CREATE OR REPLACE FUNCTION public.owns_primary_company(pc_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.primary_company
    WHERE id = pc_id AND user_id = auth.uid()
  );
$$;

-- RLS para tabelas relacionadas (usando a função helper)
CREATE POLICY "Users can manage their primary company glassdoor"
  ON public.primary_company_glassdoor FOR ALL
  USING (public.owns_primary_company(primary_company_id));

CREATE POLICY "Users can manage their primary company market research"
  ON public.primary_company_market_research FOR ALL
  USING (public.owns_primary_company(primary_company_id));

CREATE POLICY "Users can manage their primary company market news"
  ON public.primary_company_market_news FOR ALL
  USING (public.owns_primary_company(primary_company_id));

CREATE POLICY "Users can manage their primary company leadership"
  ON public.primary_company_leadership FOR ALL
  USING (public.owns_primary_company(primary_company_id));

CREATE POLICY "Users can manage their primary company linkedin posts"
  ON public.primary_company_linkedin_posts FOR ALL
  USING (public.owns_primary_company(primary_company_id));

CREATE POLICY "Users can manage their primary company instagram posts"
  ON public.primary_company_instagram_posts FOR ALL
  USING (public.owns_primary_company(primary_company_id));

CREATE POLICY "Users can manage their primary company youtube videos"
  ON public.primary_company_youtube_videos FOR ALL
  USING (public.owns_primary_company(primary_company_id));

CREATE POLICY "Users can manage their primary company similar companies"
  ON public.primary_company_similar_companies FOR ALL
  USING (public.owns_primary_company(primary_company_id));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_primary_company_updated_at
  BEFORE UPDATE ON public.primary_company
  FOR EACH ROW
  EXECUTE FUNCTION public.update_companies_updated_at();
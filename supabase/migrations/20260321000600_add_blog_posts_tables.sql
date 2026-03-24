-- Add blog_url column to primary entity tables
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS blog_url TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS blog_url TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS blog_url TEXT;
ALTER TABLE public.primary_company ADD COLUMN IF NOT EXISTS blog_url TEXT;

-- Create company_blog_posts table
CREATE TABLE IF NOT EXISTS public.company_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT,
  url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  reading_time_minutes INTEGER,
  categories TEXT,
  cover_image_url TEXT,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create prospect_blog_posts table
CREATE TABLE IF NOT EXISTS public.prospect_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
  title TEXT,
  url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  reading_time_minutes INTEGER,
  categories TEXT,
  cover_image_url TEXT,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create client_blog_posts table
CREATE TABLE IF NOT EXISTS public.client_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT,
  url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  reading_time_minutes INTEGER,
  categories TEXT,
  cover_image_url TEXT,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create primary_company_blog_posts table
CREATE TABLE IF NOT EXISTS public.primary_company_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_company_id UUID REFERENCES public.primary_company(id) ON DELETE CASCADE,
  title TEXT,
  url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  reading_time_minutes INTEGER,
  categories TEXT,
  cover_image_url TEXT,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS policies for companies
ALTER TABLE public.company_blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.company_blog_posts FOR SELECT USING (true);
CREATE POLICY "Enable all actions for authenticated users" ON public.company_blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS policies for prospects
ALTER TABLE public.prospect_blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.prospect_blog_posts FOR SELECT USING (true);
CREATE POLICY "Enable all actions for authenticated users" ON public.prospect_blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS policies for clients
ALTER TABLE public.client_blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.client_blog_posts FOR SELECT USING (true);
CREATE POLICY "Enable all actions for authenticated users" ON public.client_blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS policies for primary_company
ALTER TABLE public.primary_company_blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.primary_company_blog_posts FOR SELECT USING (true);
CREATE POLICY "Enable all actions for authenticated users" ON public.primary_company_blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

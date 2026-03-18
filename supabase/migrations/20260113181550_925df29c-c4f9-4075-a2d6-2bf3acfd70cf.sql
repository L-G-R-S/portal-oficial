-- Create public bucket for post media images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for post-media bucket
CREATE POLICY "Anyone can read post media" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-media');

CREATE POLICY "Service role can upload post media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'post-media');

CREATE POLICY "Service role can update post media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'post-media');

CREATE POLICY "Service role can delete post media" ON storage.objects
  FOR DELETE USING (bucket_id = 'post-media');

-- Add cached_thumbnail_url columns to all social post tables

-- Companies (competitors)
ALTER TABLE linkedin_posts ADD COLUMN IF NOT EXISTS cached_thumbnail_url TEXT;
ALTER TABLE instagram_posts ADD COLUMN IF NOT EXISTS cached_thumbnail_url TEXT;

-- Prospects
ALTER TABLE prospect_linkedin_posts ADD COLUMN IF NOT EXISTS cached_thumbnail_url TEXT;
ALTER TABLE prospect_instagram_posts ADD COLUMN IF NOT EXISTS cached_thumbnail_url TEXT;

-- Clients
ALTER TABLE client_linkedin_posts ADD COLUMN IF NOT EXISTS cached_thumbnail_url TEXT;
ALTER TABLE client_instagram_posts ADD COLUMN IF NOT EXISTS cached_thumbnail_url TEXT;

-- Primary Company
ALTER TABLE primary_company_linkedin_posts ADD COLUMN IF NOT EXISTS cached_thumbnail_url TEXT;
ALTER TABLE primary_company_instagram_posts ADD COLUMN IF NOT EXISTS cached_thumbnail_url TEXT;
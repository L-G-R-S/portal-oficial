-- Add UNIQUE constraints to prevent duplicate social media posts
-- LinkedIn posts
ALTER TABLE linkedin_posts ADD CONSTRAINT linkedin_posts_unique_external 
  UNIQUE NULLS NOT DISTINCT (company_id, external_id);

ALTER TABLE prospect_linkedin_posts ADD CONSTRAINT prospect_linkedin_posts_unique_external 
  UNIQUE NULLS NOT DISTINCT (prospect_id, external_id);

ALTER TABLE client_linkedin_posts ADD CONSTRAINT client_linkedin_posts_unique_external 
  UNIQUE NULLS NOT DISTINCT (client_id, external_id);

ALTER TABLE primary_company_linkedin_posts ADD CONSTRAINT primary_company_linkedin_posts_unique_external 
  UNIQUE NULLS NOT DISTINCT (primary_company_id, external_id);

-- Instagram posts
ALTER TABLE instagram_posts ADD CONSTRAINT instagram_posts_unique_external 
  UNIQUE NULLS NOT DISTINCT (company_id, external_id);

ALTER TABLE prospect_instagram_posts ADD CONSTRAINT prospect_instagram_posts_unique_external 
  UNIQUE NULLS NOT DISTINCT (prospect_id, external_id);

ALTER TABLE client_instagram_posts ADD CONSTRAINT client_instagram_posts_unique_external 
  UNIQUE NULLS NOT DISTINCT (client_id, external_id);

ALTER TABLE primary_company_instagram_posts ADD CONSTRAINT primary_company_instagram_posts_unique_external 
  UNIQUE NULLS NOT DISTINCT (primary_company_id, external_id);

-- YouTube videos
ALTER TABLE youtube_videos ADD CONSTRAINT youtube_videos_unique_external 
  UNIQUE NULLS NOT DISTINCT (company_id, external_id);

ALTER TABLE prospect_youtube_videos ADD CONSTRAINT prospect_youtube_videos_unique_external 
  UNIQUE NULLS NOT DISTINCT (prospect_id, external_id);

ALTER TABLE client_youtube_videos ADD CONSTRAINT client_youtube_videos_unique_external 
  UNIQUE NULLS NOT DISTINCT (client_id, external_id);

ALTER TABLE primary_company_youtube_videos ADD CONSTRAINT primary_company_youtube_videos_unique_external 
  UNIQUE NULLS NOT DISTINCT (primary_company_id, external_id);
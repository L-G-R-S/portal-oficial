-- Remove old constraint and add new one with 'content_news'
ALTER TABLE public.update_settings DROP CONSTRAINT update_settings_update_type_check;

ALTER TABLE public.update_settings ADD CONSTRAINT update_settings_update_type_check 
CHECK (update_type = ANY (ARRAY['full'::text, 'content_news'::text, 'news_only'::text]));
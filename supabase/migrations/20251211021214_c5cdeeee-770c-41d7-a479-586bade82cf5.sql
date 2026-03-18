-- Add missing instagram_follows column to primary_company table
ALTER TABLE public.primary_company 
ADD COLUMN instagram_follows integer;
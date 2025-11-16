-- Add website_url column to renovation_partners table
-- Run this in Supabase SQL Editor

ALTER TABLE public.renovation_partners 
ADD COLUMN IF NOT EXISTS website_url VARCHAR(500);

-- Add comment to the column
COMMENT ON COLUMN public.renovation_partners.website_url IS 'Website or listing URL for the renovation partner';


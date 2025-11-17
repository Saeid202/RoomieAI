-- Fix required columns for work_exchange_offers table
-- Make title and created_by nullable OR set defaults
-- Run this in your Supabase SQL Editor

-- Option 1: Make title nullable (if not essential)
ALTER TABLE public.work_exchange_offers
ALTER COLUMN title DROP NOT NULL;

-- Option 2: Make created_by nullable OR set default to user_id
-- Since created_by should match user_id, we can make it nullable
-- and let the application set it, OR set a default
ALTER TABLE public.work_exchange_offers
ALTER COLUMN created_by DROP NOT NULL;

-- Alternative: Set default for created_by to use user_id via trigger
-- But simpler is to just make it nullable and let the app set it

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'work_exchange_offers'
  AND column_name IN ('title', 'created_by')
ORDER BY column_name;


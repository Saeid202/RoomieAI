-- Fix title column constraint for work_exchange_offers table
-- Option 1: Make title nullable (if title is not essential)
ALTER TABLE public.work_exchange_offers
ALTER COLUMN title DROP NOT NULL;

-- Option 2: If you want to keep title as NOT NULL but allow empty strings
-- ALTER TABLE public.work_exchange_offers
-- ALTER COLUMN title SET DEFAULT '';

-- Verify the change
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'work_exchange_offers'
  AND column_name = 'title';


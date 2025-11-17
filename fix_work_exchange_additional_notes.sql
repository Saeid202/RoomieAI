-- Fix work_exchange_offers table - Add missing additional_notes column
-- Run this in your Supabase SQL Editor

-- Add additional_notes column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Add comment to the column
COMMENT ON COLUMN public.work_exchange_offers.additional_notes IS 'Additional notes or information about the work exchange offer';

-- Verify the column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'work_exchange_offers'
  AND column_name = 'additional_notes';


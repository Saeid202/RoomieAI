-- Complete fix for work_exchange_offers table
-- This script adds all missing columns that the application code expects
-- Run this in your Supabase SQL Editor

-- Add user_id column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_name column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Add user_email column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Add space_type column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS space_type TEXT;

-- Add work_requested column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS work_requested TEXT;

-- Add duration column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS duration TEXT;

-- Add work_hours_per_week column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS work_hours_per_week TEXT;

-- Add address column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add city column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add state column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS state TEXT;

-- Add zip_code column if it doesn't exist (nullable)
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Add amenities_provided column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS amenities_provided TEXT[] DEFAULT '{}';

-- Add additional_notes column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Add images column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add contact_preference column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS contact_preference TEXT;

-- Add created_at column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Add updated_at column if it doesn't exist
ALTER TABLE public.work_exchange_offers
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add comments to columns
COMMENT ON COLUMN public.work_exchange_offers.user_id IS 'Reference to the user who created the offer';
COMMENT ON COLUMN public.work_exchange_offers.user_name IS 'Name of the user (denormalized for performance)';
COMMENT ON COLUMN public.work_exchange_offers.user_email IS 'Email of the user (denormalized for performance)';
COMMENT ON COLUMN public.work_exchange_offers.space_type IS 'Type of space: private-room, shared-room, studio, entire-apartment, basement, other';
COMMENT ON COLUMN public.work_exchange_offers.work_requested IS 'Description of work requested';
COMMENT ON COLUMN public.work_exchange_offers.duration IS 'Duration of the work exchange';
COMMENT ON COLUMN public.work_exchange_offers.work_hours_per_week IS 'Number of work hours per week';
COMMENT ON COLUMN public.work_exchange_offers.address IS 'Street address';
COMMENT ON COLUMN public.work_exchange_offers.city IS 'City';
COMMENT ON COLUMN public.work_exchange_offers.state IS 'State or province';
COMMENT ON COLUMN public.work_exchange_offers.zip_code IS 'ZIP or postal code';
COMMENT ON COLUMN public.work_exchange_offers.amenities_provided IS 'Array of amenities provided';
COMMENT ON COLUMN public.work_exchange_offers.additional_notes IS 'Additional notes or information about the work exchange offer';
COMMENT ON COLUMN public.work_exchange_offers.images IS 'Array of image URLs for the work exchange offer';
COMMENT ON COLUMN public.work_exchange_offers.contact_preference IS 'Preferred contact method: email, phone, messenger';

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_user_id ON public.work_exchange_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_status ON public.work_exchange_offers(status);
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_city ON public.work_exchange_offers(city);
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_space_type ON public.work_exchange_offers(space_type);
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_created_at ON public.work_exchange_offers(created_at DESC);

-- Verify all columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'work_exchange_offers'
ORDER BY ordinal_position;

-- Refresh the schema cache (this helps Supabase recognize the new columns)
NOTIFY pgrst, 'reload schema';

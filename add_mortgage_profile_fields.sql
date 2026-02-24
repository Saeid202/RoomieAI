-- Run this if you already created the mortgage_profiles table
-- This adds the new fields to the existing table

ALTER TABLE public.mortgage_profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS first_time_buyer BOOLEAN,
ADD COLUMN IF NOT EXISTS buying_with_co_borrower BOOLEAN,
ADD COLUMN IF NOT EXISTS co_borrower_details TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mortgage_profiles'
ORDER BY ordinal_position;

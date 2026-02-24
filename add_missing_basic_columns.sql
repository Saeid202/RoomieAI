-- Add missing basic info columns to mortgage_profiles
ALTER TABLE public.mortgage_profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS first_time_buyer BOOLEAN,
ADD COLUMN IF NOT EXISTS buying_with_co_borrower BOOLEAN,
ADD COLUMN IF NOT EXISTS co_borrower_details TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mortgage_profiles'
AND column_name IN ('date_of_birth', 'first_time_buyer', 'buying_with_co_borrower', 'co_borrower_details')
ORDER BY ordinal_position;

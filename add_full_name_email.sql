-- Add missing full_name and email columns to mortgage_profiles
ALTER TABLE public.mortgage_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mortgage_profiles'
AND column_name IN ('full_name', 'email')
ORDER BY ordinal_position;

-- Add Employment & Income Snapshot fields to mortgage_profiles table

ALTER TABLE public.mortgage_profiles 
ADD COLUMN IF NOT EXISTS employment_status TEXT CHECK (employment_status IN ('employed', 'contractor', 'self_employed')),
ADD COLUMN IF NOT EXISTS employment_type TEXT CHECK (employment_type IN ('permanent', 'part_time')),
ADD COLUMN IF NOT EXISTS employer_name TEXT,
ADD COLUMN IF NOT EXISTS client_names TEXT[],
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS employment_duration TEXT,
ADD COLUMN IF NOT EXISTS contracting_duration TEXT,
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_duration TEXT,
ADD COLUMN IF NOT EXISTS income_range TEXT,
ADD COLUMN IF NOT EXISTS variable_income_types TEXT[];

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mortgage_profiles'
AND column_name IN (
    'employment_status', 'employment_type', 'employer_name', 'client_names',
    'industry', 'employment_duration', 'contracting_duration', 'business_name',
    'business_duration', 'income_range', 'variable_income_types'
)
ORDER BY ordinal_position;

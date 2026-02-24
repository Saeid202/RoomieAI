-- Add Property Intent fields to mortgage_profiles table

ALTER TABLE public.mortgage_profiles 
ADD COLUMN IF NOT EXISTS purchase_price_range TEXT,
ADD COLUMN IF NOT EXISTS property_type TEXT,
ADD COLUMN IF NOT EXISTS intended_use TEXT,
ADD COLUMN IF NOT EXISTS target_location TEXT,
ADD COLUMN IF NOT EXISTS timeline_to_buy TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mortgage_profiles'
AND column_name IN (
    'purchase_price_range', 'property_type', 'intended_use',
    'target_location', 'timeline_to_buy'
)
ORDER BY ordinal_position;

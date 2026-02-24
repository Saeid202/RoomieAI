-- Add Assets & Down Payment Snapshot fields to mortgage_profiles table

ALTER TABLE public.mortgage_profiles 
ADD COLUMN IF NOT EXISTS intended_down_payment TEXT,
ADD COLUMN IF NOT EXISTS funding_sources TEXT[],
ADD COLUMN IF NOT EXISTS funding_other_explanation TEXT,
ADD COLUMN IF NOT EXISTS gift_provider_relationship TEXT,
ADD COLUMN IF NOT EXISTS gift_amount_range TEXT,
ADD COLUMN IF NOT EXISTS gift_letter_available BOOLEAN,
ADD COLUMN IF NOT EXISTS liquid_savings_balance TEXT,
ADD COLUMN IF NOT EXISTS has_investments TEXT,
ADD COLUMN IF NOT EXISTS investment_value_range TEXT,
ADD COLUMN IF NOT EXISTS has_cryptocurrency BOOLEAN,
ADD COLUMN IF NOT EXISTS crypto_storage_type TEXT,
ADD COLUMN IF NOT EXISTS crypto_exposure_level TEXT,
ADD COLUMN IF NOT EXISTS funds_outside_canada BOOLEAN,
ADD COLUMN IF NOT EXISTS funds_country_region TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mortgage_profiles'
AND column_name IN (
    'intended_down_payment', 'funding_sources', 'funding_other_explanation',
    'gift_provider_relationship', 'gift_amount_range', 'gift_letter_available',
    'liquid_savings_balance', 'has_investments', 'investment_value_range',
    'has_cryptocurrency', 'crypto_storage_type', 'crypto_exposure_level',
    'funds_outside_canada', 'funds_country_region'
)
ORDER BY ordinal_position;

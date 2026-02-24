-- Add Credit & Debts (Self-Declared) fields to mortgage_profiles table

ALTER TABLE public.mortgage_profiles 
ADD COLUMN IF NOT EXISTS credit_score_range TEXT,
ADD COLUMN IF NOT EXISTS monthly_debt_payments NUMERIC,
ADD COLUMN IF NOT EXISTS missed_payments_last_12_months BOOLEAN,
ADD COLUMN IF NOT EXISTS bankruptcy_proposal_history BOOLEAN,
ADD COLUMN IF NOT EXISTS credit_additional_notes TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mortgage_profiles'
AND column_name IN (
    'credit_score_range', 'monthly_debt_payments', 'missed_payments_last_12_months',
    'bankruptcy_proposal_history', 'credit_additional_notes'
)
ORDER BY ordinal_position;

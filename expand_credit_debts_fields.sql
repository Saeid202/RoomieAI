-- Expand Credit & Debts fields in mortgage_profiles table

-- Add detailed debt breakdown fields
ALTER TABLE public.mortgage_profiles 
ADD COLUMN IF NOT EXISTS debt_credit_cards NUMERIC,
ADD COLUMN IF NOT EXISTS debt_personal_loans NUMERIC,
ADD COLUMN IF NOT EXISTS debt_auto_loans NUMERIC,
ADD COLUMN IF NOT EXISTS debt_student_loans NUMERIC,
ADD COLUMN IF NOT EXISTS debt_other NUMERIC,

-- Add missed payments details (conditional on missed_payments_last_12_months = true)
ADD COLUMN IF NOT EXISTS missed_payment_type TEXT,
ADD COLUMN IF NOT EXISTS missed_payment_count INTEGER,
ADD COLUMN IF NOT EXISTS last_missed_payment_date TEXT,

-- Add bankruptcy/proposal details (conditional on bankruptcy_proposal_history = true)
ADD COLUMN IF NOT EXISTS bankruptcy_type TEXT,
ADD COLUMN IF NOT EXISTS bankruptcy_filing_year TEXT,
ADD COLUMN IF NOT EXISTS bankruptcy_discharge_date TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mortgage_profiles'
AND column_name IN (
    'debt_credit_cards', 'debt_personal_loans', 'debt_auto_loans', 
    'debt_student_loans', 'debt_other',
    'missed_payment_type', 'missed_payment_count', 'last_missed_payment_date',
    'bankruptcy_type', 'bankruptcy_filing_year', 'bankruptcy_discharge_date'
)
ORDER BY ordinal_position;

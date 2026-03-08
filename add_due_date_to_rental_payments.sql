-- Add due_date column to rental_payments table
-- This column is needed for tracking when rent payments are due

BEGIN;

ALTER TABLE public.rental_payments 
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add index for querying by due date
CREATE INDEX IF NOT EXISTS idx_rental_payments_due_date 
ON public.rental_payments(due_date);

-- Add comment
COMMENT ON COLUMN public.rental_payments.due_date IS 
'Date when the rent payment is due';

COMMIT;

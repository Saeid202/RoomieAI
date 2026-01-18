-- Apply Stripe Connect columns to payment_accounts table
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Add stripe_account_status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_accounts' 
        AND column_name = 'stripe_account_status'
    ) THEN
        ALTER TABLE public.payment_accounts 
        ADD COLUMN stripe_account_status VARCHAR(50) DEFAULT 'not_started' 
        CHECK (stripe_account_status IN ('not_started', 'onboarding', 'completed', 'restricted'));
    END IF;
END $$;

-- 2. Add stripe_onboarding_completed_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_accounts' 
        AND column_name = 'stripe_onboarding_completed_at'
    ) THEN
        ALTER TABLE public.payment_accounts 
        ADD COLUMN stripe_onboarding_completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 3. Update existing accounts to have 'not_started' status if null
UPDATE public.payment_accounts 
SET stripe_account_status = 'not_started' 
WHERE stripe_account_status IS NULL;

-- 4. Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'payment_accounts'
AND column_name IN ('stripe_account_status', 'stripe_onboarding_completed_at', 'stripe_account_id');

COMMIT;

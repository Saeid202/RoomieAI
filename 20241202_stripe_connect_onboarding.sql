-- Stripe Connect Landlord Onboarding Migration
-- This script extends the payment_accounts table to support Stripe Express onboarding

BEGIN;

-- 1. Extend payment_accounts with Stripe Connect fields
ALTER TABLE public.payment_accounts 
ADD COLUMN IF NOT EXISTS stripe_account_status VARCHAR(50) DEFAULT 'not_started' 
CHECK (stripe_account_status IN ('not_started', 'onboarding', 'completed', 'restricted')),
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- 2. Update existing accounts to have 'not_started' status if null
UPDATE public.payment_accounts 
SET stripe_account_status = 'not_started' 
WHERE stripe_account_status IS NULL;

-- 3. Ensure RLS is enabled (it should be, but let's be safe)
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;

-- 4. Update policies to ensure landlords can view/update their account status
-- (Policies already exist in the 20241201 migration, but let's verify if they cover these columns)
-- "Users can view their own payment accounts" - exists
-- "Users can update their own payment accounts" - exists

COMMIT;

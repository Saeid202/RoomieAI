-- Canadian PAD Payment Support Migration
-- Phase 1: Add support for ACSS Debit (Pre-Authorized Debit) payments
-- Created: 2026-02-19

BEGIN;

-- =====================================================
-- 1. UPDATE payment_methods TABLE
-- =====================================================
-- Add columns to support PAD payment methods and mandates

-- Add payment_type to distinguish between card and PAD
ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) 
CHECK (payment_type IN ('card', 'acss_debit', 'bank_account'));

-- Add mandate tracking for PAD payments
ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS mandate_id VARCHAR(255);

ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS mandate_status VARCHAR(50);

ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS mandate_accepted_at TIMESTAMP WITH TIME ZONE;

-- Add bank details for PAD
ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);

ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS transit_number VARCHAR(10);

ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS institution_number VARCHAR(10);

-- Add Stripe payment method ID (if not exists from previous migrations)
ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS stripe_payment_method_id VARCHAR(255);

-- Add card details (if not exists)
ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS card_type VARCHAR(20);

ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS brand VARCHAR(50);

ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS last4 VARCHAR(4);

ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS exp_month INTEGER;

ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS exp_year INTEGER;

-- =====================================================
-- 2. UPDATE rent_payments TABLE
-- =====================================================
-- Add columns to track payment method type and fees

-- Add payment method type for reporting
ALTER TABLE public.rent_payments 
ADD COLUMN IF NOT EXISTS payment_method_type VARCHAR(20);

-- Add transaction fee tracking
ALTER TABLE public.rent_payments 
ADD COLUMN IF NOT EXISTS transaction_fee DECIMAL(10,2) DEFAULT 0.00;

-- Add processing days for PAD payments
ALTER TABLE public.rent_payments 
ADD COLUMN IF NOT EXISTS processing_days INTEGER;

-- Add payment cleared timestamp for PAD
ALTER TABLE public.rent_payments 
ADD COLUMN IF NOT EXISTS payment_cleared_at TIMESTAMP WITH TIME ZONE;

-- Add expected clear date for PAD
ALTER TABLE public.rent_payments 
ADD COLUMN IF NOT EXISTS expected_clear_date DATE;

-- Add Stripe mandate ID reference
ALTER TABLE public.rent_payments 
ADD COLUMN IF NOT EXISTS stripe_mandate_id VARCHAR(255);

-- Add Stripe payment intent ID (if not exists)
ALTER TABLE public.rent_payments 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on payment_type for filtering
CREATE INDEX IF NOT EXISTS idx_payment_methods_payment_type 
ON public.payment_methods(payment_type);

-- Index on mandate_id for lookups
CREATE INDEX IF NOT EXISTS idx_payment_methods_mandate_id 
ON public.payment_methods(mandate_id);

-- Index on stripe_payment_method_id for Stripe operations
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_pm_id 
ON public.payment_methods(stripe_payment_method_id);

-- Index on payment_method_type for reporting
CREATE INDEX IF NOT EXISTS idx_rent_payments_method_type 
ON public.rent_payments(payment_method_type);

-- Index on expected_clear_date for PAD tracking
CREATE INDEX IF NOT EXISTS idx_rent_payments_clear_date 
ON public.rent_payments(expected_clear_date);

-- Index on stripe_payment_intent_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_rent_payments_stripe_pi_id 
ON public.rent_payments(stripe_payment_intent_id);

-- =====================================================
-- 4. UPDATE EXISTING DATA (OPTIONAL)
-- =====================================================
-- Set payment_type for existing records based on method_type

UPDATE public.payment_methods 
SET payment_type = 'card' 
WHERE payment_type IS NULL 
AND method_type = 'card';

UPDATE public.payment_methods 
SET payment_type = 'bank_account' 
WHERE payment_type IS NULL 
AND method_type = 'bank_account';

-- =====================================================
-- 5. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN public.payment_methods.payment_type IS 
'Type of payment method: card (credit/debit), acss_debit (Canadian PAD), bank_account (legacy)';

COMMENT ON COLUMN public.payment_methods.mandate_id IS 
'Stripe mandate ID for PAD payments - required for recurring debits';

COMMENT ON COLUMN public.payment_methods.mandate_status IS 
'Status of PAD mandate: active, inactive, pending, revoked';

COMMENT ON COLUMN public.payment_methods.mandate_accepted_at IS 
'Timestamp when tenant accepted the PAD mandate agreement';

COMMENT ON COLUMN public.rent_payments.payment_method_type IS 
'Type of payment method used: card, acss_debit - for reporting and analytics';

COMMENT ON COLUMN public.rent_payments.transaction_fee IS 
'Fee charged for this transaction (1% for PAD, 2.9% for card)';

COMMENT ON COLUMN public.rent_payments.processing_days IS 
'Number of days to process payment (0 for card, 3-5 for PAD)';

COMMENT ON COLUMN public.rent_payments.expected_clear_date IS 
'Expected date when PAD payment will clear (3-5 business days from initiation)';

COMMIT;

-- =====================================================
-- ROLLBACK SCRIPT (Save separately if needed)
-- =====================================================
-- To rollback this migration, run:
/*
BEGIN;

-- Remove indexes
DROP INDEX IF EXISTS public.idx_payment_methods_payment_type;
DROP INDEX IF EXISTS public.idx_payment_methods_mandate_id;
DROP INDEX IF EXISTS public.idx_payment_methods_stripe_pm_id;
DROP INDEX IF EXISTS public.idx_rent_payments_method_type;
DROP INDEX IF EXISTS public.idx_rent_payments_clear_date;
DROP INDEX IF EXISTS public.idx_rent_payments_stripe_pi_id;

-- Remove columns from rent_payments
ALTER TABLE public.rent_payments DROP COLUMN IF EXISTS payment_method_type;
ALTER TABLE public.rent_payments DROP COLUMN IF EXISTS transaction_fee;
ALTER TABLE public.rent_payments DROP COLUMN IF EXISTS processing_days;
ALTER TABLE public.rent_payments DROP COLUMN IF EXISTS payment_cleared_at;
ALTER TABLE public.rent_payments DROP COLUMN IF EXISTS expected_clear_date;
ALTER TABLE public.rent_payments DROP COLUMN IF EXISTS stripe_mandate_id;
ALTER TABLE public.rent_payments DROP COLUMN IF EXISTS stripe_payment_intent_id;

-- Remove columns from payment_methods
ALTER TABLE public.payment_methods DROP COLUMN IF EXISTS payment_type;
ALTER TABLE public.payment_methods DROP COLUMN IF EXISTS mandate_id;
ALTER TABLE public.payment_methods DROP COLUMN IF EXISTS mandate_status;
ALTER TABLE public.payment_methods DROP COLUMN IF EXISTS mandate_accepted_at;
ALTER TABLE public.payment_methods DROP COLUMN IF EXISTS bank_name;
ALTER TABLE public.payment_methods DROP COLUMN IF EXISTS transit_number;
ALTER TABLE public.payment_methods DROP COLUMN IF EXISTS institution_number;

COMMIT;
*/

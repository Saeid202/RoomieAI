-- Add landlord payout method support to payment_accounts table
-- This enables landlords to choose between bank account (standard) or debit card (instant) payouts

BEGIN;

-- Add payout method columns
ALTER TABLE payment_accounts 
ADD COLUMN IF NOT EXISTS payout_method_type VARCHAR(20) CHECK (payout_method_type IN ('bank_account', 'debit_card')),
ADD COLUMN IF NOT EXISTS payout_method_status VARCHAR(20) DEFAULT 'pending' CHECK (payout_method_status IN ('pending', 'verifying', 'verified', 'failed')),
ADD COLUMN IF NOT EXISTS bank_account_last4 VARCHAR(4),
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS bank_routing_number VARCHAR(20), -- Institution + Transit combined
ADD COLUMN IF NOT EXISTS bank_account_type VARCHAR(20) CHECK (bank_account_type IN ('checking', 'savings')),
ADD COLUMN IF NOT EXISTS card_last4 VARCHAR(4),
ADD COLUMN IF NOT EXISTS card_brand VARCHAR(20),
ADD COLUMN IF NOT EXISTS card_exp_month INTEGER,
ADD COLUMN IF NOT EXISTS card_exp_year INTEGER,
ADD COLUMN IF NOT EXISTS stripe_external_account_id VARCHAR(255), -- Stripe's external account ID
ADD COLUMN IF NOT EXISTS verification_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payout_schedule VARCHAR(20) DEFAULT 'standard' CHECK (payout_schedule IN ('standard', 'instant')); -- standard = 2-7 days, instant = 30 min

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_accounts_payout_status ON payment_accounts(payout_method_status);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_payout_type ON payment_accounts(payout_method_type);

-- Add comment for documentation
COMMENT ON COLUMN payment_accounts.payout_method_type IS 'Type of payout method: bank_account (standard, free) or debit_card (instant, 1% fee)';
COMMENT ON COLUMN payment_accounts.payout_method_status IS 'Verification status: pending, verifying, verified, failed';
COMMENT ON COLUMN payment_accounts.payout_schedule IS 'Payout speed: standard (2-7 days, free) or instant (30 min, 1% fee)';

COMMIT;

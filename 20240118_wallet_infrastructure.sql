-- Add balance tracking columns for Landlord Wallet UI
ALTER TABLE payment_accounts ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE payment_accounts ADD COLUMN IF NOT EXISTS available_balance DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE payment_accounts ADD COLUMN IF NOT EXISTS total_paid_out DECIMAL(15,2) DEFAULT 0.00;

-- Create table for Stripe Event Idempotency
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create atomic increment/decrement functions for wallet balances
CREATE OR REPLACE FUNCTION update_landlord_wallet_balances(
    p_user_id UUID,
    p_pending_delta DECIMAL,
    p_available_delta DECIMAL,
    p_paid_out_delta DECIMAL
)
RETURNS VOID AS $$
BEGIN
    UPDATE payment_accounts
    SET 
        pending_balance = pending_balance + p_pending_delta,
        available_balance = available_balance + p_available_delta,
        total_paid_out = total_paid_out + p_paid_out_delta,
        updated_at = NOW()
    WHERE user_id = p_user_id AND account_type = 'landlord';
END;
$$ LANGUAGE plpgsql;

-- Update RLS for testing/read-only
ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;
-- (Existing policies usually cover select/update for users, but we might need service role access which is implicit)

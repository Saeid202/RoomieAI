-- Create user_stripe_customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_stripe_customers (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_stripe_customers ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own customer mapping
CREATE POLICY "Users can view own stripe customer" ON user_stripe_customers
    FOR SELECT USING (auth.uid() = user_id);

-- Add columns for Stripe Financial Connections to payment_methods table
ALTER TABLE payment_methods
ADD COLUMN IF NOT EXISTS bank_connection_token TEXT,
ADD COLUMN IF NOT EXISTS authorization_status TEXT,
ADD COLUMN IF NOT EXISTS payment_method_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN payment_methods.bank_connection_token IS 'Stripe Financial Connections Account ID (fca_...)';
COMMENT ON COLUMN payment_methods.authorization_status IS 'Status of the debit authorization (e.g., approved, revoked)';

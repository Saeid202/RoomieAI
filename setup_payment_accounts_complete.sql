-- Complete Payment System Setup
-- This script creates all necessary tables for landlord payments and Stripe Connect

BEGIN;

-- =====================================================
-- 1. CREATE PAYMENT_ACCOUNTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  account_type VARCHAR(20) CHECK (account_type IN ('tenant', 'landlord')) NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'CAD',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  stripe_account_id VARCHAR(255),
  stripe_account_status VARCHAR(50) DEFAULT 'not_started' CHECK (stripe_account_status IN ('not_started', 'onboarding', 'completed', 'restricted')),
  stripe_onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, account_type)
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_payment_accounts_user_id ON payment_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_type ON payment_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_stripe_id ON payment_accounts(stripe_account_id);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payment accounts" ON payment_accounts;
DROP POLICY IF EXISTS "Users can insert their own payment accounts" ON payment_accounts;
DROP POLICY IF EXISTS "Users can update their own payment accounts" ON payment_accounts;

-- Policy: Users can view their own accounts
CREATE POLICY "Users can view their own payment accounts" ON payment_accounts
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own accounts
CREATE POLICY "Users can insert their own payment accounts" ON payment_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own accounts
CREATE POLICY "Users can update their own payment accounts" ON payment_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 5. CREATE UPDATE TRIGGER
-- =====================================================

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_payment_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_payment_accounts_updated_at ON payment_accounts;

-- Create trigger
CREATE TRIGGER update_payment_accounts_updated_at 
  BEFORE UPDATE ON payment_accounts
  FOR EACH ROW 
  EXECUTE FUNCTION update_payment_accounts_updated_at();

-- =====================================================
-- 6. VERIFY SETUP
-- =====================================================

-- Check table exists
SELECT 
  'payment_accounts table created' as status,
  COUNT(*) as row_count
FROM payment_accounts;

-- Check columns
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'payment_accounts'
ORDER BY ordinal_position;

-- Check policies
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'payment_accounts';

COMMIT;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Payment accounts table setup complete!' as message;

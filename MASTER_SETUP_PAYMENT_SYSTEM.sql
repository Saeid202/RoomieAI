-- =====================================================
-- MASTER SETUP SCRIPT - Fix All Payment System Issues
-- =====================================================
-- Run this script in Supabase SQL Editor to fix all 500 errors
-- This script is safe to run multiple times (idempotent)
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: CREATE PAYMENT_ACCOUNTS TABLE
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_accounts_user_id ON payment_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_type ON payment_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_stripe_id ON payment_accounts(stripe_account_id);

-- Enable RLS
ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view their own payment accounts" ON payment_accounts;
DROP POLICY IF EXISTS "Users can insert their own payment accounts" ON payment_accounts;
DROP POLICY IF EXISTS "Users can update their own payment accounts" ON payment_accounts;

CREATE POLICY "Users can view their own payment accounts" ON payment_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment accounts" ON payment_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment accounts" ON payment_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_payment_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payment_accounts_updated_at ON payment_accounts;
CREATE TRIGGER update_payment_accounts_updated_at 
  BEFORE UPDATE ON payment_accounts
  FOR EACH ROW 
  EXECUTE FUNCTION update_payment_accounts_updated_at();

-- =====================================================
-- STEP 2: FIX RENTAL_PAYMENTS FOREIGN KEY
-- =====================================================

-- Add foreign key to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'rental_payments_tenant_id_fkey_profiles'
        AND table_name = 'rental_payments'
    ) THEN
        -- First, check if profiles table exists and has matching records
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
            -- Add the foreign key constraint
            ALTER TABLE rental_payments 
            ADD CONSTRAINT rental_payments_tenant_id_fkey_profiles 
            FOREIGN KEY (tenant_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE;
            
            RAISE NOTICE '✅ Foreign key constraint added to profiles table';
        ELSE
            RAISE NOTICE '⚠️ Profiles table does not exist - skipping foreign key';
        END IF;
    ELSE
        RAISE NOTICE '✅ Foreign key constraint already exists';
    END IF;
END $$;

-- =====================================================
-- STEP 3: VERIFY SETUP
-- =====================================================

-- Check payment_accounts table
DO $$
DECLARE
    table_exists BOOLEAN;
    row_count INTEGER;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'payment_accounts'
    ) INTO table_exists;
    
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM payment_accounts;
        RAISE NOTICE '✅ payment_accounts table exists (% rows)', row_count;
    ELSE
        RAISE NOTICE '❌ payment_accounts table does not exist';
    END IF;
END $$;

-- Check rental_payments table
DO $$
DECLARE
    table_exists BOOLEAN;
    row_count INTEGER;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'rental_payments'
    ) INTO table_exists;
    
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM rental_payments;
        RAISE NOTICE '✅ rental_payments table exists (% rows)', row_count;
    ELSE
        RAISE NOTICE '❌ rental_payments table does not exist';
    END IF;
END $$;

-- List all columns in payment_accounts
SELECT 
  '✅ payment_accounts columns:' as info,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'payment_accounts'
ORDER BY ordinal_position;

-- List all foreign keys on rental_payments
SELECT 
  '✅ rental_payments foreign keys:' as info,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'rental_payments';

COMMIT;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT '🎉 Payment system setup complete! You can now test the landlord onboarding flow.' as message;

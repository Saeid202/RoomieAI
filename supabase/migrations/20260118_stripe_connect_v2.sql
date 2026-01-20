-- Migration: Stripe Connect Express for Landlords (Idempotent Version)
-- Part A: Database Schema

BEGIN;

-- 1. Create enum for onboarding status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_onboarding_status') THEN
        CREATE TYPE stripe_onboarding_status AS ENUM ('not_started', 'in_progress', 'restricted', 'ready');
    END IF;
END $$;

-- 2. Create landlord_connect_accounts table
CREATE TABLE IF NOT EXISTS landlord_connect_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_account_id TEXT UNIQUE NOT NULL,
    onboarding_status stripe_onboarding_status DEFAULT 'not_started',
    charges_enabled BOOLEAN DEFAULT FALSE,
    payouts_enabled BOOLEAN DEFAULT FALSE,
    requirements_currently_due JSONB DEFAULT '[]'::jsonb,
    requirements_eventually_due JSONB DEFAULT '[]'::jsonb,
    details_submitted BOOLEAN DEFAULT FALSE,
    last_stripe_sync_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Create landlord_payout_transfers table
CREATE TABLE IF NOT EXISTS landlord_payout_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_intent_id TEXT UNIQUE NOT NULL,
    stripe_transfer_id TEXT UNIQUE NOT NULL,
    landlord_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- in cents
    currency TEXT NOT NULL DEFAULT 'cad',
    status TEXT NOT NULL CHECK (status IN ('created', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create stripe_webhook_events for idempotency
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    event_id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE landlord_connect_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlord_payout_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for landlord_connect_accounts
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'landlord_connect_accounts' 
        AND policyname = 'Users can view their own connect account'
    ) THEN
        CREATE POLICY "Users can view their own connect account" 
            ON landlord_connect_accounts 
            FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 7. RLS Policies for landlord_payout_transfers
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'landlord_payout_transfers' 
        AND policyname = 'Users can view their own transfers'
    ) THEN
        CREATE POLICY "Users can view their own transfers" 
            ON landlord_payout_transfers 
            FOR SELECT 
            USING (auth.uid() = landlord_user_id);
    END IF;
END $$;

-- 8. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_landlord_connect_accounts_updated_at'
    ) THEN
        CREATE TRIGGER update_landlord_connect_accounts_updated_at
            BEFORE UPDATE ON landlord_connect_accounts
            FOR EACH ROW
            EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;

COMMIT;

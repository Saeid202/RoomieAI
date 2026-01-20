-- =====================================================
-- COMPREHENSIVE PAYMENT SYSTEM FIX
-- =====================================================
-- 1. Ensure columns exist and are nullable where appropriate
-- For manual digital wallet payments, application_id and property_id MUST be nullable.

-- Check if rental_payments exists and modify it
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rental_payments') THEN
        -- Make application_id and property_id NULLABLE
        ALTER TABLE rental_payments ALTER COLUMN application_id DROP NOT NULL;
        ALTER TABLE rental_payments ALTER COLUMN property_id DROP NOT NULL;
        
        -- Add note column if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'rental_payments' AND column_name = 'note') THEN
            ALTER TABLE rental_payments ADD COLUMN note TEXT;
        END IF;

        -- Add recipient_email if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'rental_payments' AND column_name = 'recipient_email') THEN
            ALTER TABLE rental_payments ADD COLUMN recipient_email TEXT;
        END IF;

        -- Add payment_intent_id if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'rental_payments' AND column_name = 'payment_intent_id') THEN
            ALTER TABLE rental_payments ADD COLUMN payment_intent_id TEXT;
        END IF;

        -- Add payment_source if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'rental_payments' AND column_name = 'payment_source') THEN
            ALTER TABLE rental_payments ADD COLUMN payment_source TEXT DEFAULT 'manual';
        END IF;

        -- Update payment_type constraint to allow 'rent_payment'
        ALTER TABLE rental_payments DROP CONSTRAINT IF EXISTS rental_payments_payment_type_check;
        ALTER TABLE rental_payments ADD CONSTRAINT rental_payments_payment_type_check 
        CHECK (payment_type IN ('first_month_rent', 'security_deposit', 'application_fee', 'combined_initial', 'rent_payment', 'manual_transfer'));
    END IF;
END $$;

-- 2. Ensure stripe_webhook_events table exists for idempotency
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ensure payment_accounts has balance columns for landlords
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_accounts') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_accounts' AND column_name = 'pending_balance') THEN
            ALTER TABLE payment_accounts ADD COLUMN pending_balance DECIMAL(15,2) DEFAULT 0.00;
        END IF;
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_accounts' AND column_name = 'available_balance') THEN
            ALTER TABLE payment_accounts ADD COLUMN available_balance DECIMAL(15,2) DEFAULT 0.00;
        END IF;
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_accounts' AND column_name = 'total_paid_out') THEN
            ALTER TABLE payment_accounts ADD COLUMN total_paid_out DECIMAL(15,2) DEFAULT 0.00;
        END IF;
    END IF;
END $$;

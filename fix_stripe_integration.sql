-- Fix Stripe integration tables and issues
-- Run this after the main database fix

-- 1. CREATE USER_STRIPE_CUSTOMERS TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS public.user_stripe_customers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_stripe_customers_user_id ON public.user_stripe_customers(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_stripe_customers_stripe_id ON public.user_stripe_customers(stripe_customer_id);

-- Enable RLS
ALTER TABLE public.user_stripe_customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might cause conflicts
DROP POLICY IF EXISTS "Users can view own stripe customer" ON public.user_stripe_customers;
DROP POLICY IF EXISTS "Users can insert own stripe customer" ON public.user_stripe_customers;
DROP POLICY IF EXISTS "Users can update own stripe customer" ON public.user_stripe_customers;
DROP POLICY IF EXISTS "Users can delete own stripe customer" ON public.user_stripe_customers;

-- RLS Policies
CREATE POLICY "Users can view own stripe customer" ON public.user_stripe_customers
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can insert own stripe customer" ON public.user_stripe_customers
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can update own stripe customer" ON public.user_stripe_customers
    FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can delete own stripe customer" ON public.user_stripe_customers
    FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_stripe_customers TO authenticated;
GRANT SELECT ON public.user_stripe_customers TO anon;

-- 2. UPDATE PAYMENT_METHODS TABLE TO SUPPORT BANK CONNECTIONS
-- ===========================================================

-- Check if payment_methods table exists and add missing columns if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_methods') THEN
        -- Add bank connection columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_methods' AND column_name = 'bank_connection_token') THEN
            ALTER TABLE public.payment_methods ADD COLUMN bank_connection_token text;
            RAISE NOTICE 'Added bank_connection_token to payment_methods';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_methods' AND column_name = 'authorization_status') THEN
            ALTER TABLE public.payment_methods ADD COLUMN authorization_status text DEFAULT 'pending';
            RAISE NOTICE 'Added authorization_status to payment_methods';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_methods' AND column_name = 'last_verified_at') THEN
            ALTER TABLE public.payment_methods ADD COLUMN last_verified_at timestamp with time zone;
            RAISE NOTICE 'Added last_verified_at to payment_methods';
        END IF;
    END IF;
END $$;

-- 3. VERIFY ALL TABLES EXIST
-- ===========================

SELECT 
    table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) as exists
FROM (VALUES 
    ('user_profiles'),
    ('user_consents'),
    ('user_stripe_customers'),
    ('payment_methods')
) AS t(table_name);

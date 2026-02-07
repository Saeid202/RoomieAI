-- Test Stripe Financial Connections Verification
-- This helps verify Step 1 of the "Money to Credit" Pipeline

-- 1. Check if user_stripe_customers table exists and has data
SELECT 
    'user_stripe_customers table exists' as test,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_stripe_customers') as result
UNION ALL
SELECT 
    'user_stripe_customers has records' as test,
    EXISTS (SELECT 1 FROM user_stripe_customers LIMIT 1) as result
UNION ALL
SELECT 
    'payment_methods table exists' as test,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_methods') as result
UNION ALL
SELECT 
    'payment_methods has bank accounts' as test,
    EXISTS (SELECT 1 FROM payment_methods WHERE card_type = 'bank_account' LIMIT 1) as result;

-- 2. Check Stripe configuration (if accessible through environment)
-- Note: This will show if STRIPE_SECRET_KEY is configured
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_settings WHERE name = 'stripe.secret_key') THEN
        RAISE NOTICE 'Stripe key is configured in database settings';
    ELSE
        RAISE NOTICE 'Stripe key not found in database settings (likely in environment)';
    END IF;
END $$;

-- 3. Check for any existing financial connections sessions
-- This would be in Stripe logs, not database, but we can check related records
SELECT 
    COUNT(*) as total_payment_methods,
    COUNT(CASE WHEN card_type = 'bank_account' THEN 1 END) as bank_accounts,
    COUNT(CASE WHEN card_type = 'credit' THEN 1 END) as credit_cards,
    COUNT(CASE WHEN card_type = 'debit' THEN 1 END) as debit_cards
FROM payment_methods;

-- 4. Verify user has proper permissions for bank connections
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email,
    auth.role() as current_role;

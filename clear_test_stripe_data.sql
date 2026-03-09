-- Clear test mode Stripe data from database
-- Run this when switching from test to live mode

-- 1. Clear test customer IDs from payment_accounts
UPDATE payment_accounts
SET stripe_account_id = NULL
WHERE stripe_account_id LIKE 'cus_test_%' 
   OR stripe_account_id LIKE 'cus_%';

-- 2. Clear test payment methods
DELETE FROM payment_methods
WHERE stripe_payment_method_id LIKE 'pm_test_%'
   OR stripe_payment_method_id LIKE 'pm_%';

-- 3. Verify cleanup
SELECT 
  'payment_accounts' as table_name,
  COUNT(*) as remaining_records
FROM payment_accounts
WHERE stripe_account_id IS NOT NULL

UNION ALL

SELECT 
  'payment_methods' as table_name,
  COUNT(*) as remaining_records
FROM payment_methods;

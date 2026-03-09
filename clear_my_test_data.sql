-- Clear test Stripe data for ALL users
-- This is safe - it just clears the test customer IDs so new live ones can be created

-- Clear test customer IDs from payment_accounts
UPDATE payment_accounts
SET stripe_account_id = NULL
WHERE stripe_account_id IS NOT NULL;

-- Clear all test payment methods
DELETE FROM payment_methods;

-- Verify cleanup
SELECT 
  'Cleared payment_accounts' as status,
  COUNT(*) as records_with_stripe_id
FROM payment_accounts
WHERE stripe_account_id IS NOT NULL

UNION ALL

SELECT 
  'Cleared payment_methods' as status,
  COUNT(*) as remaining_records
FROM payment_methods;

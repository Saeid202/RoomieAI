-- Live Payment System Verification Script
-- Run this to verify your database is ready for live payments

-- 1. Check if payment tables exist
SELECT 
  'rent_payments table' as check_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'rent_payments'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

SELECT 
  'payment_methods table' as check_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'payment_methods'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 2. Check for recent test payments (should be none in production)
SELECT 
  'Test payments in database' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ CLEAN'
    ELSE '⚠️ HAS TEST DATA'
  END as status
FROM rent_payments
WHERE stripe_payment_intent_id LIKE 'pi_test_%';

-- 3. Verify RLS policies are enabled
SELECT 
  'RLS on rent_payments' as check_name,
  CASE 
    WHEN relrowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as status
FROM pg_class
WHERE relname = 'rent_payments';

-- 4. Check for landlords with payout methods
SELECT 
  'Landlords with payout setup' as check_name,
  COUNT(DISTINCT user_id) as count
FROM landlord_payout_methods
WHERE stripe_account_id IS NOT NULL;

-- 5. Check for active properties
SELECT 
  'Active rental properties' as check_name,
  COUNT(*) as count
FROM properties
WHERE status = 'active' 
  AND listing_category = 'rental';

-- 6. Verify webhook endpoint configuration
-- (This needs to be checked manually in Stripe Dashboard)
SELECT 
  '⚠️ MANUAL CHECK REQUIRED' as check_name,
  'Verify webhook endpoint in Stripe Dashboard' as action,
  'https://dashboard.stripe.com/webhooks' as url;

-- 7. Check for users ready to make payments
SELECT 
  'Tenants with active leases' as check_name,
  COUNT(DISTINCT tenant_id) as count
FROM lease_agreements
WHERE status = 'active';

-- 8. Verify payment status tracking
SELECT 
  'Payment statuses available' as check_name,
  string_agg(DISTINCT status, ', ') as available_statuses
FROM rent_payments
WHERE status IS NOT NULL;

-- Summary Report
SELECT 
  '=== LIVE PAYMENT READINESS SUMMARY ===' as report;

SELECT 
  CASE 
    WHEN (
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_name IN ('rent_payments', 'payment_methods', 'landlord_payout_methods')
    ) = 3 THEN '✅ All required tables exist'
    ELSE '❌ Missing required tables'
  END as database_structure;

SELECT 
  CASE 
    WHEN (
      SELECT COUNT(*) FROM rent_payments 
      WHERE stripe_payment_intent_id LIKE 'pi_test_%'
    ) = 0 THEN '✅ No test data in production'
    ELSE '⚠️ Clean up test data before going live'
  END as data_cleanliness;

SELECT 
  '⚠️ Remember to verify:' as reminder,
  '1. Stripe webhook configured' as step_1,
  '2. Live API keys in Supabase secrets' as step_2,
  '3. Edge functions deployed' as step_3,
  '4. Test transaction with real bank account' as step_4;

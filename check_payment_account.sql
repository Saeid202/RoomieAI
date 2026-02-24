-- Check if the bank account was saved
SELECT 
  user_id,
  account_type,
  stripe_account_id,
  stripe_external_account_id,
  payout_method_type,
  payout_method_status,
  bank_account_last4,
  bank_name,
  bank_routing_number,
  created_at
FROM payment_accounts
WHERE user_id = '05979fd9-3da8-45b4-8999-aa784f046bf4'
ORDER BY created_at DESC;

-- Check payment methods in database
SELECT 
  id,
  user_id,
  payment_type,
  stripe_payment_method_id,
  bank_name,
  last4,
  is_default,
  created_at
FROM payment_methods
ORDER BY created_at DESC
LIMIT 10;

-- Check if stripe_payment_method_id is valid format
SELECT 
  id,
  stripe_payment_method_id,
  CASE 
    WHEN stripe_payment_method_id LIKE 'pm_%' THEN 'Valid Stripe PM ID'
    WHEN stripe_payment_method_id LIKE 'seti_%' THEN 'Setup Intent ID (WRONG!)'
    ELSE 'Unknown format'
  END as id_type
FROM payment_methods
ORDER BY created_at DESC;

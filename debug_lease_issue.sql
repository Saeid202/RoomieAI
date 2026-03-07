-- Check if there are any lease contracts for your user
-- Replace 'YOUR_USER_ID' with your actual user ID

-- First, let's see all lease contracts for you as tenant
SELECT 
  lc.id as lease_id,
  lc.application_id,
  lc.tenant_id,
  lc.monthly_rent,
  lc.status,
  lc.lease_start_date,
  ra.status as application_status,
  ra.id as app_id
FROM lease_contracts lc
LEFT JOIN rental_applications ra ON lc.application_id = ra.id
WHERE lc.tenant_id = auth.uid();

-- Check if there are any rental_payments
SELECT 
  id,
  application_id,
  amount,
  status,
  created_at
FROM rental_payments
WHERE user_id = auth.uid();

-- Check your applications
SELECT 
  id,
  status,
  property_id,
  created_at
FROM rental_applications
WHERE applicant_id = auth.uid()
ORDER BY created_at DESC;

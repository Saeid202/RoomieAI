-- STEP 1: Check what lease contracts exist for you
-- This will show you the lease that's causing the payment to appear

SELECT 
  lc.id as lease_id,
  lc.application_id,
  lc.monthly_rent,
  lc.status as lease_status,
  lc.tenant_id,
  ra.id as app_id,
  ra.status as app_status
FROM lease_contracts lc
LEFT JOIN rental_applications ra ON lc.application_id = ra.id
WHERE lc.tenant_id = auth.uid();

-- STEP 2: If you see a lease contract above, DELETE IT with this command:
-- UNCOMMENT THE LINES BELOW TO DELETE:

/*
DELETE FROM lease_contracts
WHERE tenant_id = auth.uid();
*/

-- STEP 3: Verify it's gone (should return 0 rows)
/*
SELECT COUNT(*) as remaining_leases
FROM lease_contracts
WHERE tenant_id = auth.uid();
*/

-- STEP 4: Also check and delete any rental_payments
/*
SELECT * FROM rental_payments WHERE user_id = auth.uid();

DELETE FROM rental_payments WHERE user_id = auth.uid();
*/

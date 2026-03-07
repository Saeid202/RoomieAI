-- This script will clean up any lease contracts associated with withdrawn applications
-- Run this if you still see rent payments after withdrawing an application

-- Step 1: Check what will be deleted (SAFE - just viewing)
SELECT 
  lc.id as lease_id,
  lc.monthly_rent,
  lc.status as lease_status,
  ra.id as app_id,
  ra.status as app_status,
  ra.property_id
FROM lease_contracts lc
INNER JOIN rental_applications ra ON lc.application_id = ra.id
WHERE lc.tenant_id = auth.uid()
  AND ra.status IN ('withdrawn', 'rejected');

-- Step 2: Delete lease contracts for withdrawn/rejected applications
-- UNCOMMENT THE LINES BELOW TO ACTUALLY DELETE:

/*
DELETE FROM lease_contracts
WHERE application_id IN (
  SELECT id 
  FROM rental_applications 
  WHERE applicant_id = auth.uid() 
    AND status IN ('withdrawn', 'rejected')
);
*/

-- Step 3: Verify deletion (should return 0 rows)
/*
SELECT COUNT(*) as remaining_withdrawn_leases
FROM lease_contracts lc
INNER JOIN rental_applications ra ON lc.application_id = ra.id
WHERE lc.tenant_id = auth.uid()
  AND ra.status IN ('withdrawn', 'rejected');
*/

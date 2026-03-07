-- Run this to see what lease contracts exist for your user
-- This will help us understand what's in the database

SELECT 
  lc.id as lease_contract_id,
  lc.application_id,
  lc.monthly_rent,
  lc.status as lease_status,
  lc.lease_start_date,
  lc.created_at as lease_created,
  ra.id as application_id_check,
  ra.status as application_status,
  ra.property_id
FROM lease_contracts lc
LEFT JOIN rental_applications ra ON lc.application_id = ra.id
WHERE lc.tenant_id = auth.uid()
ORDER BY lc.created_at DESC;

-- Also check if there are multiple lease contracts
SELECT COUNT(*) as total_lease_contracts
FROM lease_contracts
WHERE tenant_id = auth.uid();

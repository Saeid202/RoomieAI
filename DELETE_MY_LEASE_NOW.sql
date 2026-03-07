-- RUN THIS IN SUPABASE SQL EDITOR TO DELETE YOUR LEASE CONTRACT
-- This will remove the rent payment from Digital Wallet

-- Step 1: See what will be deleted (SAFE - just viewing)
SELECT 
  id,
  monthly_rent,
  status,
  lease_start_date,
  created_at
FROM lease_contracts
WHERE tenant_id = auth.uid();

-- Step 2: DELETE IT (uncomment the line below and run)
-- DELETE FROM lease_contracts WHERE tenant_id = auth.uid();

-- Step 3: Verify it's gone (should return 0 rows)
-- SELECT COUNT(*) FROM lease_contracts WHERE tenant_id = auth.uid();

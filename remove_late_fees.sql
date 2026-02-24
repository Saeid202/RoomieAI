-- Remove Late Fee Management Feature
-- This script removes late fee related database objects

-- Drop late fee calculation function
DROP FUNCTION IF EXISTS calculate_late_fee(DECIMAL, INTEGER);

-- Remove late_fee column from rent_payments table
ALTER TABLE IF EXISTS rent_payments DROP COLUMN IF EXISTS late_fee;

-- Note: If you have separate late_fee_policies or late_fees tables, add DROP statements here
-- Example:
-- DROP TABLE IF EXISTS late_fee_policies CASCADE;
-- DROP TABLE IF EXISTS late_fees CASCADE;

COMMENT ON SCHEMA public IS 'Late fee management feature removed';

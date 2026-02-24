-- Remove Auto-Pay and Rent Savings Features
-- This script removes all database tables and related objects

-- Drop auto_pay_configs table and related objects
DROP TRIGGER IF EXISTS update_auto_pay_configs_updated_at ON auto_pay_configs;
DROP POLICY IF EXISTS "Users can delete their own auto-pay configs" ON auto_pay_configs;
DROP POLICY IF EXISTS "Users can update their own auto-pay configs" ON auto_pay_configs;
DROP POLICY IF EXISTS "Users can insert their own auto-pay configs" ON auto_pay_configs;
DROP POLICY IF EXISTS "Users can view their own auto-pay configs" ON auto_pay_configs;
DROP INDEX IF EXISTS idx_auto_pay_configs_next_payment;
DROP INDEX IF EXISTS idx_auto_pay_configs_tenant_id;
DROP TABLE IF EXISTS auto_pay_configs CASCADE;

-- Remove auto_pay_enabled column from lease_contracts
ALTER TABLE IF EXISTS lease_contracts DROP COLUMN IF EXISTS auto_pay_enabled;

-- Clean up user_consent_tracking entries related to autopay
DELETE FROM user_consent_tracking WHERE source = 'autopay_setup';

COMMENT ON SCHEMA public IS 'Auto-pay and rent savings features removed';

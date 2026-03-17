-- Rename pending_tenant_signature to pending in lease_contracts table
-- This simplifies the status naming to be more intuitive

-- Drop existing constraint
ALTER TABLE public.lease_contracts DROP CONSTRAINT IF EXISTS lease_contracts_status_check;

-- Add new constraint with updated status values
ALTER TABLE public.lease_contracts ADD CONSTRAINT lease_contracts_status_check
CHECK (status IN ('draft', 'pending_landlord_signature', 'pending', 'fully_signed', 'executed', 'active', 'cancelled'));

-- Update any existing records with old status value
UPDATE public.lease_contracts
SET status = 'pending'
WHERE status = 'pending_tenant_signature';
-- Add property archiving fields to properties table
-- This migration adds fields needed for the property archiving system

-- Add status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'status'
  ) THEN
    ALTER TABLE properties ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;

-- Add archived_at column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'archived_at'
  ) THEN
    ALTER TABLE properties ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add archive_reason column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'archive_reason'
  ) THEN
    ALTER TABLE properties ADD COLUMN archive_reason TEXT;
  END IF;
END $$;

-- Add current_lease_id column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'current_lease_id'
  ) THEN
    ALTER TABLE properties ADD COLUMN current_lease_id UUID REFERENCES lease_contracts(id);
  END IF;
END $$;

-- Add current_tenant_id column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'current_tenant_id'
  ) THEN
    ALTER TABLE properties ADD COLUMN current_tenant_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_landlord_status ON properties(user_id, status);

-- Add check constraint for valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'properties_status_check'
  ) THEN
    ALTER TABLE properties ADD CONSTRAINT properties_status_check 
    CHECK (status IN ('active', 'archived', 'draft', 'inactive'));
  END IF;
END $$;

-- Update existing properties to have 'active' status if NULL
UPDATE properties SET status = 'active' WHERE status IS NULL;

COMMENT ON COLUMN properties.status IS 'Property status: active (available for rent), archived (rented), draft (not published), inactive (temporarily unavailable)';
COMMENT ON COLUMN properties.archived_at IS 'Timestamp when property was archived';
COMMENT ON COLUMN properties.archive_reason IS 'Reason for archiving (e.g., lease_signed, maintenance)';
COMMENT ON COLUMN properties.current_lease_id IS 'Current active lease contract for this property';
COMMENT ON COLUMN properties.current_tenant_id IS 'Current tenant renting this property';

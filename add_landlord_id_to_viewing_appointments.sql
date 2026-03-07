-- Add landlord_id column to property_viewing_appointments table
-- This is needed so landlords can query their appointments efficiently

-- Add the column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'property_viewing_appointments' 
    AND column_name = 'landlord_id'
  ) THEN
    ALTER TABLE property_viewing_appointments
    ADD COLUMN landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added landlord_id column';
  ELSE
    RAISE NOTICE 'landlord_id column already exists';
  END IF;
END $$;

-- Backfill landlord_id for existing appointments
UPDATE property_viewing_appointments pva
SET landlord_id = p.user_id
FROM properties p
WHERE pva.property_id = p.id
AND pva.landlord_id IS NULL;

-- Make landlord_id NOT NULL after backfilling
ALTER TABLE property_viewing_appointments
ALTER COLUMN landlord_id SET NOT NULL;

-- Create index for efficient landlord queries
CREATE INDEX IF NOT EXISTS idx_viewing_appointments_landlord 
ON property_viewing_appointments(landlord_id);

-- Verify the fix
SELECT 
  COUNT(*) as total_appointments,
  COUNT(landlord_id) as appointments_with_landlord_id,
  COUNT(*) - COUNT(landlord_id) as missing_landlord_id
FROM property_viewing_appointments;

RAISE NOTICE 'Migration complete! landlord_id column added and backfilled.';

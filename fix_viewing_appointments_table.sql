-- Fix property_viewing_appointments table - add missing column

-- Add is_custom_request column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'property_viewing_appointments' 
    AND column_name = 'is_custom_request'
  ) THEN
    ALTER TABLE property_viewing_appointments 
    ADD COLUMN is_custom_request BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Now create the index
DROP INDEX IF EXISTS idx_viewing_appointments_custom;
CREATE INDEX idx_viewing_appointments_custom ON property_viewing_appointments(is_custom_request);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'property_viewing_appointments'
ORDER BY ordinal_position;

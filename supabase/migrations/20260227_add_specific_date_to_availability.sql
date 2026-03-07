-- Add specific_date column to landlord_availability table
-- This allows landlords to set availability for specific dates (e.g., March 15, 2024)
-- instead of just recurring day-of-week patterns

-- Add the new column (nullable to support both specific dates and recurring patterns)
ALTER TABLE landlord_availability 
ADD COLUMN IF NOT EXISTS specific_date DATE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_landlord_availability_specific_date 
ON landlord_availability(specific_date);

-- Add index for combined property + date queries
CREATE INDEX IF NOT EXISTS idx_landlord_availability_property_date 
ON landlord_availability(property_id, specific_date);

-- Add comment explaining the column
COMMENT ON COLUMN landlord_availability.specific_date IS 
'Specific date for availability (e.g., 2024-03-15). If NULL, uses day_of_week for recurring pattern.';

-- Note: We keep day_of_week column for backward compatibility and potential future recurring patterns
-- When specific_date is set, it takes precedence over day_of_week

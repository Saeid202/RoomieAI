-- Remove neighborhood column from properties table
-- This field is no longer needed in the UI

ALTER TABLE properties 
DROP COLUMN IF EXISTS neighborhood;

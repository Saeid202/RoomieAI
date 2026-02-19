-- Fix existing properties that don't have a status
-- This sets all NULL status values to 'active'

UPDATE properties 
SET status = 'active' 
WHERE status IS NULL;

-- Verify the update
SELECT id, listing_title, status, created_at 
FROM properties 
ORDER BY created_at DESC 
LIMIT 10;

-- Update properties from 'available' to 'active'
-- The new system uses 'active' instead of 'available'
UPDATE properties 
SET status = 'active' 
WHERE status = 'available';

-- Verify the update
SELECT 
  id, 
  listing_title, 
  status, 
  city,
  monthly_rent
FROM properties 
ORDER BY created_at DESC;

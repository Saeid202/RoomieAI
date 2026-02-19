-- Step 1: Drop the constraint temporarily
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;

-- Step 2: Update 'available' to 'active'
UPDATE properties 
SET status = 'active' 
WHERE status = 'available';

-- Step 3: Recreate the constraint with 'available' included for backward compatibility
ALTER TABLE properties ADD CONSTRAINT properties_status_check 
CHECK (status IN ('active', 'available', 'archived', 'draft', 'inactive'));

-- Step 4: Verify the update
SELECT 
  id, 
  listing_title, 
  status, 
  city,
  monthly_rent
FROM properties 
ORDER BY created_at DESC;

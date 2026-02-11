-- Fix the specific property that's still failing
-- Property ID: 03649016-68ab-4927-bc84-711953dc8527

-- Step 1: Check what lease contracts exist for this property
SELECT 
    'Lease Contracts for Property' as check_type,
    lc.id,
    lc.property_id,
    lc.tenant_id,
    lc.status,
    lc.created_at
FROM lease_contracts lc
WHERE lc.property_id = '03649016-68ab-4927-bc84-711953dc8527'
ORDER BY lc.created_at DESC;

-- Step 2: Check rental applications for this property
SELECT 
    'Rental Applications for Property' as check_type,
    ra.id,
    ra.property_id,
    ra.full_name,
    ra.status,
    ra.created_at
FROM rental_applications ra
WHERE ra.property_id = '03649016-68ab-4927-bc84-711953dc8527'
ORDER BY ra.created_at DESC;

-- Step 3: Force delete all related records for this specific property
-- Note: This bypasses RLS policies temporarily

-- Delete rental applications first
DELETE FROM rental_applications 
WHERE property_id = '03649016-68ab-4927-bc84-711953dc8527';

-- Delete lease contracts second
DELETE FROM lease_contracts 
WHERE property_id = '03649016-68ab-4927-bc84-711953dc8527';

-- Finally delete the property
DELETE FROM properties 
WHERE id = '03649016-68ab-4927-bc84-711953dc8527';

-- Step 4: Verify the property is deleted
SELECT 
    'Property Status After Deletion' as check_type,
    COUNT(*) as remaining_properties
FROM properties 
WHERE id = '03649016-68ab-4927-bc84-711953dc8527';

-- Step 5: Verify related records are also deleted
SELECT 
    'Related Records Status' as check_type,
    COUNT(*) as remaining_lease_contracts
FROM lease_contracts 
WHERE property_id = '03649016-68ab-4927-bc84-711953dc8527'

UNION ALL

SELECT 
    'Related Records Status' as check_type,
    COUNT(*) as remaining_applications
FROM rental_applications 
WHERE property_id = '03649016-68ab-4927-bc84-711953dc8527';

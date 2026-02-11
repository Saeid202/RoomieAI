-- Fix Foreign Key Constraint Issue for Property Deletion (CORRECTED)
-- Only using tables that actually exist in the database

-- Step 1: Check what lease contracts exist for this property
SELECT 
    'Lease Contracts for Property' as check_type,
    lc.id,
    lc.property_id,
    lc.tenant_id,
    lc.status,
    lc.created_at
FROM lease_contracts lc
WHERE lc.property_id = '664901b7-9a0b-4af9-985f-37d85ccdde0f'
ORDER BY lc.created_at DESC;

-- Step 2: Check for other related records that might block deletion
SELECT 
    'Rental Applications' as table_name,
    COUNT(*) as record_count,
    'property_id = 664901b7-9a0b-4af9-985f-37d85ccdde0f' as condition
FROM rental_applications 
WHERE property_id = '664901b7-9a0b-4af9-985f-37d85ccdde0f'

UNION ALL

SELECT 
    'Lease Contracts' as table_name,
    COUNT(*) as record_count,
    'property_id = 664901b7-9a0b-4af9-985f-37d85ccdde0f' as condition
FROM lease_contracts 
WHERE property_id = '664901b7-9a0b-4af9-985f-37d85ccdde0f';

-- Step 3: Create a function to safely delete a property with all related records
CREATE OR REPLACE FUNCTION delete_property_safely(property_id_to_delete UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
    result_message TEXT;
BEGIN
    -- Delete rental applications first
    DELETE FROM rental_applications WHERE property_id = property_id_to_delete;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result_message := 'Deleted ' || deleted_count || ' rental applications. ';
    
    -- Delete lease contracts
    DELETE FROM lease_contracts WHERE property_id = property_id_to_delete;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result_message := result_message || 'Deleted ' || deleted_count || ' lease contracts. ';
    
    -- Finally delete the property
    DELETE FROM properties WHERE id = property_id_to_delete;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    IF deleted_count > 0 THEN
        result_message := result_message || 'Successfully deleted property. ';
    ELSE
        result_message := result_message || 'Property not found or already deleted. ';
    END IF;
    
    RETURN result_message;
END;
$$;

-- Step 4: Test the function with the problematic property
SELECT delete_property_safely('664901b7-9a0b-4af9-985f-37d85ccdde0f') as deletion_result;

-- Step 5: Verify the property is deleted
SELECT 
    'Property Status After Deletion' as check_type,
    COUNT(*) as remaining_properties
FROM properties 
WHERE id = '664901b7-9a0b-4af9-985f-37d85ccdde0f';

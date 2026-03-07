-- FORCE DELETE A PROPERTY AND ALL RELATED DATA
-- Replace 'PROPERTY_ID_HERE' with the actual property ID from the error message

-- Step 1: Find the property ID from the error or from your properties list
-- You can get it from the URL or the property card

-- Step 2: Delete all related data in the correct order

-- Delete lease contracts for this property
DELETE FROM lease_contracts 
WHERE property_id = 'PROPERTY_ID_HERE';

-- Delete rental applications for this property
DELETE FROM rental_applications 
WHERE property_id = 'PROPERTY_ID_HERE';

-- Delete rental payments for this property
DELETE FROM rental_payments 
WHERE property_id = 'PROPERTY_ID_HERE';

-- Delete property documents
DELETE FROM property_documents 
WHERE property_id = 'PROPERTY_ID_HERE';

-- Delete landlord availability for this property
DELETE FROM landlord_availability 
WHERE property_id = 'PROPERTY_ID_HERE';

-- Delete viewing appointments for this property
DELETE FROM viewing_appointments 
WHERE property_id = 'PROPERTY_ID_HERE';

-- Delete sales listings for this property
DELETE FROM sales_listings 
WHERE property_id = 'PROPERTY_ID_HERE';

-- Delete document access requests for this property
DELETE FROM document_access_requests 
WHERE property_id = 'PROPERTY_ID_HERE';

-- Finally, delete the property itself
DELETE FROM properties 
WHERE id = 'PROPERTY_ID_HERE';

-- Verify it's gone
SELECT * FROM properties WHERE id = 'PROPERTY_ID_HERE';

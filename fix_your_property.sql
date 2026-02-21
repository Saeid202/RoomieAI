-- Fix the specific property you're viewing
-- Property ID from URL: 3877de5d-dc70-4995-a92c-da4ac59a159b

-- Step 1: Update the listing_category to 'sale'
UPDATE properties
SET listing_category = 'sale'
WHERE id = '3877de5d-dc70-4995-a92c-da4ac59a159b';

-- Step 2: Verify the update worked
SELECT 
  id,
  listing_title,
  listing_category,
  property_category,
  property_configuration,
  sales_price,
  monthly_rent,
  user_id
FROM properties
WHERE id = '3877de5d-dc70-4995-a92c-da4ac59a159b';

-- Step 3: Check if documents exist for this property
SELECT 
  id,
  document_type,
  document_label,
  file_name,
  file_size,
  is_public,
  uploaded_at,
  deleted_at
FROM property_documents
WHERE property_id = '3877de5d-dc70-4995-a92c-da4ac59a159b'
ORDER BY uploaded_at DESC;

-- Step 4: Count documents
SELECT 
  COUNT(*) as total_documents,
  COUNT(CASE WHEN is_public = true THEN 1 END) as public_documents,
  COUNT(CASE WHEN is_public = false THEN 1 END) as private_documents
FROM property_documents
WHERE property_id = '3877de5d-dc70-4995-a92c-da4ac59a159b'
  AND deleted_at IS NULL;

-- Expected Results:
-- After Step 1: 1 row updated
-- After Step 2: Should show listing_category = 'sale'
-- After Step 3: Should show your uploaded documents
-- After Step 4: Should show count > 0 if documents were uploaded

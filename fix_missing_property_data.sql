-- Step 1: Check current state of your property
SELECT 
    id,
    listing_title,
    listing_category,
    property_category,
    property_configuration,
    sales_price,
    monthly_rent,
    created_at
FROM properties
WHERE id = 'a4accdd2-0cf4-4416-80fb-0b47b7beb917';

-- Step 2: Check if documents exist
SELECT 
    id,
    property_id,
    document_type,
    document_label,
    file_name,
    uploaded_at
FROM property_documents
WHERE property_id = 'a4accdd2-0cf4-4416-80fb-0b47b7beb917';

-- Step 3: Check storage bucket
SELECT id, name, public FROM storage.buckets WHERE id = 'property-documents';

-- Step 4: Check files in storage
SELECT name, bucket_id, created_at 
FROM storage.objects 
WHERE bucket_id = 'property-documents'
ORDER BY created_at DESC
LIMIT 10;

-- If you want to manually set the category and configuration for this property:
-- UPDATE properties
-- SET 
--     property_category = 'Condo',  -- Change to your actual category
--     property_configuration = '1-Bedroom'  -- Change to your actual configuration
-- WHERE id = 'a4accdd2-0cf4-4416-80fb-0b47b7beb917';

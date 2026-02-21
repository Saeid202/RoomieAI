-- Check the property you created
SELECT 
    id,
    listing_title,
    listing_category,
    property_category,
    property_configuration,
    sales_price,
    created_at
FROM properties
WHERE id = 'a4accdd2-0cf4-4416-80fb-0b47b7beb917';

-- Check if any documents exist for this property
SELECT 
    id,
    property_id,
    document_type,
    document_label,
    file_name,
    is_public,
    uploaded_at
FROM property_documents
WHERE property_id = 'a4accdd2-0cf4-4416-80fb-0b47b7beb917';

-- Check if property-documents bucket exists
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'property-documents';

-- Check if there are any files in the storage bucket
SELECT 
    name,
    bucket_id,
    created_at
FROM storage.objects
WHERE bucket_id = 'property-documents'
ORDER BY created_at DESC
LIMIT 10;

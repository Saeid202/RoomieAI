-- Check if database records exist for the uploaded files
SELECT 
    id,
    property_id,
    document_type,
    document_label,
    file_name,
    is_public,
    uploaded_at
FROM property_documents
WHERE property_id = 'a4accdd2-0cf4-4416-80fb-0b47b7beb917'
ORDER BY uploaded_at DESC;

-- Also check property details
SELECT 
    id,
    listing_title,
    listing_category,
    property_category,
    property_configuration,
    sales_price
FROM properties
WHERE id = 'a4accdd2-0cf4-4416-80fb-0b47b7beb917';

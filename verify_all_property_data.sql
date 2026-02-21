-- Verify ALL data for your property
SELECT 
    id,
    listing_title,
    listing_category,
    property_category,
    property_configuration,
    sales_price,
    address,
    city,
    state,
    zip_code,
    neighborhood,
    latitude,
    longitude,
    nearby_amenities,
    bedrooms,
    bathrooms,
    square_footage,
    description
FROM properties
WHERE id = 'a4accdd2-0cf4-4416-80fb-0b47b7beb917';

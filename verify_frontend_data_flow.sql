-- Comprehensive Frontend Data Flow Test
-- Verify the entire pipeline from database to frontend

-- Step 1: Confirm database has the data
SELECT 
    'Database Verification' as test_type,
    COUNT(*) as total_properties,
    COUNT(CASE WHEN owner_name IS NOT NULL AND owner_name != 'Property Owner' THEN 1 END) as with_names,
    COUNT(CASE WHEN owner_name IS NULL OR owner_name = 'Property Owner' THEN 1 END) as without_names
FROM public_property_owners;

-- Step 2: Show exact data that should be sent to frontend
SELECT 
    'Frontend Data Package' as test_type,
    property_id,
    listing_title,
    property_type,
    owner_name as landlord_name,
    owner_email,
    CASE 
        WHEN owner_name IS NOT NULL AND owner_name != 'Property Owner' THEN '✅ READY'
        ELSE '❌ NOT READY'
    END as frontend_ready
FROM public_property_owners
ORDER BY property_created_at DESC;

-- Step 3: Test the exact API call the frontend makes
-- Simulate fetchPublicProperties function
WITH rental_properties AS (
  SELECT 
    id,
    listing_title,
    property_type,
    address,
    city,
    state,
    zip_code,
    neighborhood,
    monthly_rent,
    bedrooms,
    bathrooms,
    square_footage,
    description,
    images,
    available_date,
    amenities,
    furnished,
    parking,
    pet_policy,
    utilities_included,
    created_at,
    updated_at,
    user_id,
    'rental' as listing_type,
    po.owner_name as landlord_name,
    po.owner_name as property_owner
  FROM properties p
  LEFT JOIN public_property_owners po ON p.id = po.property_id
  WHERE property_type = 'rental' AND is_active = true
),
sales_properties AS (
  SELECT 
    id,
    listing_title,
    property_type,
    address,
    city,
    state,
    zip_code,
    neighborhood,
    sales_price,
    bedrooms,
    bathrooms,
    square_footage,
    description,
    images,
    available_date,
    amenities,
    furnished,
    parking,
    pet_policy,
    utilities_included,
    created_at,
    updated_at,
    user_id,
    'sales' as listing_type,
    po.owner_name as landlord_name,
    po.owner_name as property_owner
  FROM properties p
  LEFT JOIN public_property_owners po ON p.id = po.property_id
  WHERE property_type = 'sales' AND is_active = true
)
SELECT 
    'Frontend API Simulation' as test_type,
    listing_type,
    COUNT(*) as count,
    COUNT(CASE WHEN landlord_name IS NOT NULL AND landlord_name != 'Property Owner' THEN 1 END) as with_landlord_names,
    COUNT(CASE WHEN landlord_name IS NULL OR landlord_name = 'Property Owner' THEN 1 END) as without_landlord_names
FROM (
  SELECT * FROM rental_properties
  UNION ALL
  SELECT * FROM sales_properties
) combined
GROUP BY listing_type;

-- Step 4: Show sample of what frontend receives
SELECT 
    'Sample Frontend Response' as test_type,
    listing_type,
    listing_title,
    landlord_name,
    property_owner,
    CASE 
        WHEN landlord_name IS NOT NULL AND landlord_name != 'Property Owner' THEN '✅ NAME AVAILABLE'
        ELSE '❌ NAME MISSING'
    END as ui_will_show
FROM (
  SELECT 
    'rental' as listing_type,
    listing_title,
    po.owner_name as landlord_name,
    po.owner_name as property_owner
  FROM properties p
  LEFT JOIN public_property_owners po ON p.id = po.property_id
  WHERE property_type = 'rental' AND is_active = true
  LIMIT 1
  UNION ALL
  SELECT 
    'sales' as listing_type,
    listing_title,
    po.owner_name as landlord_name,
    po.owner_name as property_owner
  FROM properties p
  LEFT JOIN public_property_owners po ON p.id = po.property_id
  WHERE property_type = 'sales' AND is_active = true
  LIMIT 1
) samples;

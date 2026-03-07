-- Debug: Why is a sales property application showing in rental applications?

-- 1. Find the specific application for the property
SELECT 
  a.id as application_id,
  a.property_id,
  a.user_id as applicant_id,
  a.status,
  a.created_at,
  p.listing_title,
  p.address,
  p.listing_category,
  p.monthly_rent,
  p.sales_price
FROM applications a
JOIN properties p ON p.id = a.property_id
WHERE p.address LIKE '%Grandview%'
   OR p.address LIKE '%Steeles%'
ORDER BY a.created_at DESC;

-- 2. Check all applications and their property types
SELECT 
  a.id,
  a.property_id,
  p.listing_category,
  p.listing_title,
  p.address,
  CASE 
    WHEN p.listing_category = 'sale' THEN 'SALES'
    WHEN p.listing_category = 'rental' THEN 'RENTAL'
    ELSE 'UNKNOWN'
  END as property_type,
  a.created_at
FROM applications a
JOIN properties p ON p.id = a.property_id
ORDER BY a.created_at DESC
LIMIT 20;

-- 3. Check if there's a separate table or field to distinguish application types
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'applications'
ORDER BY ordinal_position;

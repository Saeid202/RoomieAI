-- Test query to verify applications will route correctly after the fix

-- This simulates what the frontend will receive after the fix
SELECT 
  a.id as application_id,
  a.applicant_id,
  a.status,
  a.created_at,
  p.id as property_id,
  p.listing_title,
  p.address,
  p.listing_category,
  p.monthly_rent,
  p.sales_price,
  CASE 
    WHEN p.listing_category = 'sale' THEN 'Should appear in SALES INQUIRIES tab'
    WHEN p.listing_category = 'rental' OR p.listing_category IS NULL THEN 'Should appear in RENTAL APPLICATIONS tab'
    ELSE 'UNKNOWN CATEGORY'
  END as expected_tab
FROM rental_applications a
JOIN properties p ON p.id = a.property_id
ORDER BY a.created_at DESC;

-- Count by category
SELECT 
  COALESCE(p.listing_category, 'null/rental') as category,
  COUNT(*) as application_count
FROM rental_applications a
JOIN properties p ON p.id = a.property_id
GROUP BY p.listing_category
ORDER BY application_count DESC;

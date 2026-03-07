-- Find the property that's causing issues
-- This will show you the property with its related data

SELECT 
  p.id,
  p.listing_title,
  p.city,
  p.state,
  p.monthly_rent,
  (SELECT COUNT(*) FROM lease_contracts WHERE property_id = p.id) as lease_contracts_count,
  (SELECT COUNT(*) FROM rental_applications WHERE property_id = p.id) as applications_count,
  (SELECT COUNT(*) FROM rental_payments WHERE property_id = p.id) as payments_count
FROM properties p
WHERE p.user_id = auth.uid()
ORDER BY lease_contracts_count DESC, applications_count DESC;

-- This will show you which property has the most related data
-- The one with lease_contracts_count > 0 is likely the problem

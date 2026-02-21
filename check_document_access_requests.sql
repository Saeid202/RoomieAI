-- Check document access requests for your properties
SELECT 
  dar.id,
  dar.property_id,
  dar.requester_id,
  dar.status,
  dar.requested_at,
  p.listing_title,
  p.user_id as property_owner_id,
  p.listing_category
FROM document_access_requests dar
JOIN properties p ON dar.property_id = p.id
WHERE p.listing_category = 'sale'
ORDER BY dar.requested_at DESC;

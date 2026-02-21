-- Debug script to check document access requests

-- 1. Check if any requests exist at all
SELECT 
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN status = 'denied' THEN 1 END) as denied_count
FROM document_access_requests;

-- 2. Show all requests with details
SELECT 
  dar.id,
  dar.property_id,
  dar.requester_id,
  dar.requester_name,
  dar.requester_email,
  dar.status,
  dar.requested_at,
  dar.request_message
FROM document_access_requests dar
ORDER BY dar.requested_at DESC;

-- 3. Check properties that are for sale
SELECT 
  id,
  user_id as owner_id,
  listing_title,
  address,
  listing_category
FROM properties
WHERE listing_category = 'sale'
ORDER BY created_at DESC;

-- 4. Join requests with properties to see the full picture
SELECT 
  dar.id as request_id,
  dar.requester_name,
  dar.status,
  dar.requested_at,
  p.id as property_id,
  p.listing_title,
  p.address,
  p.user_id as property_owner_id,
  p.listing_category
FROM document_access_requests dar
LEFT JOIN properties p ON dar.property_id = p.id
ORDER BY dar.requested_at DESC;

-- 5. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'document_access_requests';

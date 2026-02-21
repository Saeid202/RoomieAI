-- Verify document_access_requests table exists and check for data
-- Run this to confirm the system is working

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'document_access_requests'
) as table_exists;

-- 2. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'document_access_requests'
ORDER BY ordinal_position;

-- 3. Check for any requests
SELECT COUNT(*) as total_requests FROM document_access_requests;

-- 4. Check requests with property details
SELECT 
  dar.id,
  dar.property_id,
  dar.requester_name,
  dar.requester_email,
  dar.status,
  dar.requested_at,
  p.listing_title,
  p.address,
  p.listing_category
FROM document_access_requests dar
LEFT JOIN properties p ON dar.property_id = p.id
ORDER BY dar.requested_at DESC
LIMIT 10;

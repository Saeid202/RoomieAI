-- Check for ALL properties and sales listings, regardless of owner
-- This helps identify if your sales listing exists under a different ID

SELECT 'RENTAL' as type, id, listing_title, user_id, created_at 
FROM public.properties 
ORDER BY created_at DESC 
LIMIT 10;

SELECT 'SALE' as type, id, listing_title, user_id, created_at 
FROM public.sales_listings 
ORDER BY created_at DESC 
LIMIT 10;

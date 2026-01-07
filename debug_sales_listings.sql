-- Check sales listings and their co-ownership status
SELECT id, listing_title, sales_price, is_co_ownership, user_id, downpayment_target 
FROM public.sales_listings 
ORDER BY created_at DESC 
LIMIT 5;

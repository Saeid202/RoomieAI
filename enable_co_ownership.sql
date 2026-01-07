-- Turn ON Co-ownership for your latest listing
UPDATE public.sales_listings
SET is_co_ownership = true
WHERE id = '82866677-2569-4c77-bf3a-8afadb722c4c'; -- This is the ID from your screenshot (384 Maple Leaf Drive)

-- Verify the change
SELECT id, listing_title, is_co_ownership FROM public.sales_listings WHERE id = '82866677-2569-4c77-bf3a-8afadb722c4c';

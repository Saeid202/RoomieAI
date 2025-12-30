
-- 1. Create investor_offers table (updated for Co-Buy Interest)
CREATE TABLE IF NOT EXISTS public.investor_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES public.sales_listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- New Fields
    contribution_amount NUMERIC NOT NULL,
    intended_use TEXT NOT NULL, -- 'Live-In', 'Rent / Investment', 'Mixed'
    flexibility TEXT NOT NULL, -- 'Fixed', 'Flexible'
    occupancy_plan TEXT NOT NULL, -- 'Single', 'Couple', 'Couple + kids'
    
    additional_notes TEXT, -- renamed from offer_text
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.investor_offers ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "Public offers are viewable by everyone" ON public.investor_offers;
CREATE POLICY "Public offers are viewable by everyone" 
ON public.investor_offers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can submit offers" ON public.investor_offers;
CREATE POLICY "Authenticated users can submit offers" 
ON public.investor_offers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own offers" ON public.investor_offers;
CREATE POLICY "Users can update their own offers" 
ON public.investor_offers FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own offers" ON public.investor_offers;
CREATE POLICY "Users can delete their own offers" 
ON public.investor_offers FOR DELETE USING (auth.uid() = user_id);

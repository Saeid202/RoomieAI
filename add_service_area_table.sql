-- Create a table for renovator service areas
CREATE TABLE IF NOT EXISTS public.renovator_service_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    renovator_id UUID REFERENCES public.renovation_partners(id) ON DELETE CASCADE NOT NULL,
    city TEXT NOT NULL,
    radius_km INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.renovator_service_areas ENABLE ROW LEVEL SECURITY;

-- Policies
-- Renovators can manage their own service areas
CREATE POLICY "Renovators can manage own service areas"
ON public.renovator_service_areas
FOR ALL
USING (
    renovator_id IN (
        SELECT id FROM public.renovation_partners WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    renovator_id IN (
        SELECT id FROM public.renovation_partners WHERE user_id = auth.uid()
    )
);

-- Public can view service areas (useful for matching later)
CREATE POLICY "Anyone can view service areas"
ON public.renovator_service_areas
FOR SELECT
USING (true);

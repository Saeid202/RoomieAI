-- Make rental listings visible to seekers
CREATE POLICY "Public can view properties"
ON public.properties
FOR SELECT
USING (true);
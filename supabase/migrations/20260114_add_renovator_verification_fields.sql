-- Add verification and business fields to renovation_partners
ALTER TABLE public.renovation_partners 
ADD COLUMN IF NOT EXISTS license_url TEXT,
ADD COLUMN IF NOT EXISTS government_id_url TEXT,
ADD COLUMN IF NOT EXISTS business_scope TEXT;

COMMENT ON COLUMN public.renovation_partners.license_url IS 'URL for the renovator business or trade license';
COMMENT ON COLUMN public.renovation_partners.government_id_url IS 'URL for the renovator government ID';
COMMENT ON COLUMN public.renovation_partners.business_scope IS 'Summary of the business service area and scope';

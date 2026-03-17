-- Add landlord contact information fields to user_profiles table
-- This migration adds 7 new columns for storing landlord contact details

-- Step 1: Add new columns to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS contact_unit TEXT,
ADD COLUMN IF NOT EXISTS contact_street_number TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_street_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_po_box TEXT,
ADD COLUMN IF NOT EXISTS contact_city_town TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_province TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_postal_code TEXT NOT NULL DEFAULT '';

-- Step 2: Add comment to document the new columns
COMMENT ON COLUMN public.user_profiles.contact_unit IS 'Landlord contact unit/suite number (optional)';
COMMENT ON COLUMN public.user_profiles.contact_street_number IS 'Landlord contact street number (required)';
COMMENT ON COLUMN public.user_profiles.contact_street_name IS 'Landlord contact street name (required)';
COMMENT ON COLUMN public.user_profiles.contact_po_box IS 'Landlord contact PO Box (optional)';
COMMENT ON COLUMN public.user_profiles.contact_city_town IS 'Landlord contact city/town (required)';
COMMENT ON COLUMN public.user_profiles.contact_province IS 'Landlord contact province (required)';
COMMENT ON COLUMN public.user_profiles.contact_postal_code IS 'Landlord contact postal code (required)';

-- Step 3: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_contact_info 
ON public.user_profiles(contact_city_town, contact_province);

-- Step 4: Verify migration
SELECT 'Landlord contact information fields added successfully' as status;

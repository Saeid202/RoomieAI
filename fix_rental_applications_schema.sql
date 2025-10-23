-- Fix rental_applications table schema to match frontend fields
-- Add missing columns that are collected in the frontend but missing from the database

-- Add missing columns
ALTER TABLE public.rental_applications 
ADD COLUMN IF NOT EXISTS contract_signed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS signature_data text;

-- Update the agree_to_terms constraint to allow null initially (will be set to true on submission)
-- First drop the existing constraint
ALTER TABLE public.rental_applications 
DROP CONSTRAINT IF EXISTS terms_agreement_required;

-- Add a new constraint that allows null but requires true when not null
ALTER TABLE public.rental_applications 
ADD CONSTRAINT terms_agreement_required 
CHECK (agree_to_terms IS NULL OR agree_to_terms = true);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'rental_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add user_id column to construction_supplier_profiles for better tracking
-- Note: The id column already references auth.users(id), but this makes it explicit

ALTER TABLE public.construction_supplier_profiles
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Populate user_id with the id value (since id IS the user_id)
UPDATE public.construction_supplier_profiles
SET user_id = id
WHERE user_id IS NULL;

-- Make user_id NOT NULL
ALTER TABLE public.construction_supplier_profiles
ALTER COLUMN user_id SET NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_construction_supplier_profiles_user_id 
ON public.construction_supplier_profiles(user_id);

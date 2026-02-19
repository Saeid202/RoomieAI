-- FINAL FIX: Add the missing user_type column to user_profiles
-- This is the ONLY column you're missing!

-- Add user_type column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'tenant';

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.user_type IS 'Specific user type: tenant, buyer, landlord, renovator';

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Update existing users based on their role
UPDATE public.user_profiles
SET user_type = CASE 
    WHEN role = 'landlord' THEN 'landlord'
    WHEN role = 'renovator' THEN 'renovator'
    WHEN role = 'seeker' THEN 'tenant'
    ELSE 'tenant'
END
WHERE user_type IS NULL;

-- Verify the column was added
SELECT 
    column_name,
    data_type,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'user_profiles'
    AND column_name = 'user_type';

-- Check your user profile
SELECT id, email, role, user_type, full_name 
FROM user_profiles 
WHERE email = 'chinaplusgroup@gmail.com';

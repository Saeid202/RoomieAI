-- Add profile_visibility field to roommate table
-- This field stores privacy settings for who can see the user's profile

ALTER TABLE public.roommate 
ADD COLUMN profile_visibility TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN public.roommate.profile_visibility IS 'Array of visibility settings: gays, lesbians, transgenders, everybody'; 

-- Add housing_preference and housing_preference_importance columns to the roommate table
ALTER TABLE public.roommate 
ADD COLUMN housing_preference TEXT[] DEFAULT NULL,
ADD COLUMN housing_preference_importance TEXT DEFAULT 'notImportant'::text;

-- Add comments to document the columns
COMMENT ON COLUMN public.roommate.housing_preference IS 'Array of housing preferences: onlyRoommate, sharingRoom, sharingApartment, sharingHouse, singleOneBed, twoBed, entireHouse';
COMMENT ON COLUMN public.roommate.housing_preference_importance IS 'Importance level for housing preference: notImportant, important, must';

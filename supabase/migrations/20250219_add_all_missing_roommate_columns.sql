-- Add all missing columns to the roommate table
-- This migration ensures all frontend fields have corresponding database columns

DO $$ 
BEGIN 
    -- Add housing_preference if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'roommate' AND column_name = 'housing_preference') THEN
        ALTER TABLE public.roommate ADD COLUMN housing_preference TEXT[] DEFAULT NULL;
        COMMENT ON COLUMN public.roommate.housing_preference IS 'Array of housing preferences: onlyRoommate, sharingRoom, sharingApartment, sharingHouse, singleOneBed, twoBed, entireHouse';
    END IF;

    -- Add housing_preference_importance if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'roommate' AND column_name = 'housing_preference_importance') THEN
        ALTER TABLE public.roommate ADD COLUMN housing_preference_importance TEXT DEFAULT 'notImportant';
        COMMENT ON COLUMN public.roommate.housing_preference_importance IS 'Importance level for housing preference: notImportant, important, must';
    END IF;

END $$;

-- Refresh the schema cache to ensure all columns are recognized
NOTIFY pgrst, 'reload schema';

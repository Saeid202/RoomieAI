-- Add ALL possibly missing columns to roommate table to support About Me and Ideal Roommate forms

DO $$ 
BEGIN 
    -- 0. Basic About Me Fields (Age, Gender, Visibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'age') THEN
        ALTER TABLE public.roommate ADD COLUMN age INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'gender') THEN
        ALTER TABLE public.roommate ADD COLUMN gender TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'profile_visibility') THEN
        ALTER TABLE public.roommate ADD COLUMN profile_visibility TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;

    -- 1. Housing Preference (New Field in Ideal Roommate)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'housing_preference') THEN
        ALTER TABLE public.roommate ADD COLUMN housing_preference TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'housing_preference_importance') THEN
        ALTER TABLE public.roommate ADD COLUMN housing_preference_importance TEXT DEFAULT 'notImportant';
    END IF;

    -- 2. Ensure "About Me" Demographic columns exist 
    -- (These were mapped incorrectly to _custom fields before, now we use dedicated columns)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'nationality') THEN
        ALTER TABLE public.roommate ADD COLUMN nationality TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'language') THEN
        ALTER TABLE public.roommate ADD COLUMN language TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'ethnicity') THEN
        ALTER TABLE public.roommate ADD COLUMN ethnicity TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'religion') THEN
        ALTER TABLE public.roommate ADD COLUMN religion TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'occupation') THEN
        ALTER TABLE public.roommate ADD COLUMN occupation TEXT;
    END IF;

    -- 3. Ensure Pet-related columns
    -- "pet_type" is for About Me ("I have a cat")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'pet_type') THEN
        ALTER TABLE public.roommate ADD COLUMN pet_type TEXT;
    END IF;
    
    -- "pet_preference_enum" is for Ideal Roommate ("I accept cats")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'pet_preference_enum') THEN
        ALTER TABLE public.roommate ADD COLUMN pet_preference_enum TEXT;
    END IF;

END $$;

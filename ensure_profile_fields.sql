-- Ensure age, gender, and profile_visibility columns exist in roommate table
DO $$ 
BEGIN 
    -- Check and add age
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'age') THEN
        ALTER TABLE public.roommate ADD COLUMN age INTEGER;
    END IF;

    -- Check and add gender
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'gender') THEN
        ALTER TABLE public.roommate ADD COLUMN gender TEXT;
    END IF;

    -- Check and add profile_visibility
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'profile_visibility') THEN
        ALTER TABLE public.roommate ADD COLUMN profile_visibility TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

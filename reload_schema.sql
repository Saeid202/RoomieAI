-- RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

-- Also re-run the column addition just in case it was missed
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'housing_preference') THEN
        ALTER TABLE public.roommate ADD COLUMN housing_preference TEXT[];
    END IF;
END $$;

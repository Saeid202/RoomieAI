-- RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

DO $$ 
BEGIN 
    -- Ensure housing_preference_importance exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'housing_preference_importance') THEN
        ALTER TABLE public.roommate ADD COLUMN housing_preference_importance TEXT DEFAULT 'notImportant';
    END IF;
END $$;

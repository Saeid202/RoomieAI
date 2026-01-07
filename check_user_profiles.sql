
-- Check what user_profiles is and what it returns
SELECT * FROM information_schema.tables WHERE table_name = 'user_profiles';

-- If it exists, select a few rows
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE NOTICE 'user_profiles table/view exists.';
    ELSE
        RAISE NOTICE 'user_profiles does NOT exist.';
    END IF;
END $$;

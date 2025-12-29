-- VERIFY DEMOGRAPHICS PERSISTENCE
-- This script ensures the columns exist and tests saving/loading data for them.

-- 1. Reload Schema to be safe
NOTIFY pgrst, 'reload schema';

-- 2. Ensure columns exist (Idempotent)
ALTER TABLE public.roommate ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE public.roommate ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE public.roommate ADD COLUMN IF NOT EXISTS ethnicity TEXT;
ALTER TABLE public.roommate ADD COLUMN IF NOT EXISTS religion TEXT;
ALTER TABLE public.roommate ADD COLUMN IF NOT EXISTS occupation TEXT;

-- 3. TEST: Manually save demographics for your user
-- We use lowercase keys because the frontend Dropdowns use lowercase keys
UPDATE public.roommate
SET 
    nationality = 'canadian',
    language = 'english',
    ethnicity = 'asian',
    religion = 'atheist',
    occupation = 'Software Engineer'
WHERE email = 'saeid.shabani64@gmail.com';

-- 4. Verify the data is in the database
SELECT email, nationality, language, ethnicity, religion, occupation 
FROM public.roommate 
WHERE email = 'saeid.shabani64@gmail.com';

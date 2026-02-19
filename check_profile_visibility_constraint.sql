-- Check what constraint exists on profile_visibility
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_profiles'::regclass
AND conname LIKE '%profile_visibility%';

-- Check the column definition
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
AND column_name = 'profile_visibility';

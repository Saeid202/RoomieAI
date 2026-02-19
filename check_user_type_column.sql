-- Check if user_type column exists in user_profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'user_profiles'
ORDER BY 
    ordinal_position;

-- Also check what columns are actually in the table
SELECT * FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'user_type';

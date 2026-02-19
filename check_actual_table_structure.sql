-- Check actual structure of roommate and user_profiles tables
-- This will show us what columns actually exist

-- Step 1: Check roommate table actual structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'roommate' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check what's actually in roommate table
SELECT *
FROM roommate 
LIMIT 3;

-- Step 3: Check user_profiles actual structure  
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 4: Check what's in user_profiles
SELECT id, full_name, email, created_at
FROM user_profiles 
LIMIT 3;

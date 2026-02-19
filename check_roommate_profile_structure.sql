-- Check roommate table structure and seeker profile data
-- This will help us understand what data we have and where it should go

-- Step 1: Check if roommate table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'roommate' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check what's currently in roommate table
SELECT 
    id,
    user_id,
    about_me,
    ideal_roommate,
    created_at,
    updated_at
FROM roommate 
LIMIT 5;

-- Step 3: Check user_profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 4: Check if user_profiles has about_me field
SELECT 
    id,
    full_name,
    about_me,
    email,
    created_at
FROM user_profiles 
WHERE about_me IS NOT NULL 
LIMIT 5;

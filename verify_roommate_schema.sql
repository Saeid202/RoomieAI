-- Verification script to check all roommate table columns
-- Run this in your Supabase SQL Editor to see which columns exist

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'roommate'
ORDER BY 
    ordinal_position;

-- Check for specific columns that the frontend sends
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'housing_preference') 
        THEN '✓ housing_preference exists'
        ELSE '✗ housing_preference MISSING'
    END as housing_preference_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'housing_preference_importance') 
        THEN '✓ housing_preference_importance exists'
        ELSE '✗ housing_preference_importance MISSING'
    END as housing_preference_importance_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'age_range_preference') 
        THEN '✓ age_range_preference exists'
        ELSE '✗ age_range_preference MISSING'
    END as age_range_preference_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'gender_preference') 
        THEN '✓ gender_preference exists'
        ELSE '✗ gender_preference MISSING'
    END as gender_preference_status;

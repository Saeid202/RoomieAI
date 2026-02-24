-- ============================================
-- DIAGNOSE THE EXACT ERROR
-- ============================================

-- First, let's see what the actual error is by checking the RLS policy definitions
-- The error mentions "mortgage_pr_ile_feedback" and "user_id" column

-- 1. Get the EXACT policy definition text (including the USING clause)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_clause,
    with_check AS with_check_clause
FROM pg_policies 
WHERE tablename = 'mortgage_profile_feedback'
ORDER BY policyname;

-- 2. Check if there's a column called 'user_id' in user_profiles (there shouldn't be)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name LIKE '%user%';

-- 3. Check the actual foreign key constraint definition
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'mortgage_profile_feedback';

-- 4. Let's check if there are any views or materialized views involved
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name IN ('mortgage_profile_feedback', 'user_profiles', 'mortgage_profiles');

-- 5. Check for any triggers that might be causing issues
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers
WHERE event_object_table = 'mortgage_profile_feedback';

-- 6. Get the function source code for the trigger
SELECT 
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'update_profile_review_status';

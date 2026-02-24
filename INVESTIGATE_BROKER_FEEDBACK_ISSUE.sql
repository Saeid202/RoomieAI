-- ============================================
-- COMPREHENSIVE INVESTIGATION
-- Broker Feedback System Database Setup
-- ============================================

-- 1. Check if mortgage_profile_feedback table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'mortgage_profile_feedback'
ORDER BY ordinal_position;

-- 2. Check foreign key constraints on mortgage_profile_feedback
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'mortgage_profile_feedback';

-- 3. Check user_profiles table structure (especially the primary key)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 4. Check primary key on user_profiles
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_name = 'user_profiles';

-- 5. Check mortgage_profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'mortgage_profiles'
ORDER BY ordinal_position;

-- 6. Check all RLS policies on mortgage_profile_feedback
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'mortgage_profile_feedback'
ORDER BY policyname;

-- 7. Check all triggers on mortgage_profile_feedback
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'mortgage_profile_feedback';

-- 8. Check the actual function definition for update_profile_review_status
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'update_profile_review_status';

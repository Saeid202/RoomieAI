-- Debug script to check work_exchange_offers table and policies
-- Run this in Supabase SQL editor to diagnose the issue

-- 1. Check if table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'work_exchange_offers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check RLS policies
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
WHERE tablename = 'work_exchange_offers';

-- 3. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'work_exchange_offers';

-- 4. Test insert with current user (replace with your actual user ID)
-- First, get your user ID:
SELECT auth.uid() as current_user_id;

-- 5. Check if there are any constraints that might be failing
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'work_exchange_offers'
AND tc.table_schema = 'public';

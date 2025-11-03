-- =====================================================
-- Database Tables Verification Script
-- =====================================================
-- Run this in Supabase SQL Editor to check your tables
-- =====================================================

-- Check if rental_applications table exists and show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'rental_applications' 
ORDER BY ordinal_position;

-- Check if rental_documents table exists and show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'rental_documents' 
ORDER BY ordinal_position;

-- Count existing records in both tables
SELECT 'rental_applications' as table_name, COUNT(*) as record_count
FROM rental_applications
UNION ALL
SELECT 'rental_documents' as table_name, COUNT(*) as record_count
FROM rental_documents;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('rental_applications', 'rental_documents');

-- Test basic insert (will be rolled back)
BEGIN;

-- Try to insert a test record
INSERT INTO rental_applications (
    property_id,
    applicant_id,
    full_name,
    email,
    phone,
    occupation,
    monthly_income,
    agree_to_terms,
    contract_signed,
    payment_completed
) VALUES (
    gen_random_uuid(),
    auth.uid(),
    'Test User',
    'test@example.com',
    '123-456-7890',
    'Test Occupation',
    5000,
    false,
    false,
    false
);

-- Check if insert was successful
SELECT 'Insert test successful' as result;

-- Rollback the test insert
ROLLBACK;

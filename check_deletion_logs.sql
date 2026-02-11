-- Check logs and debug property deletion issues
-- This will help us see what's happening in the database

-- First, let's check if there are any recent errors or logs
-- Check if there's a logs table or if we need to create one

-- Check if logs table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'deletion_logs'
) as logs_table_exists;

-- Create a temporary logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.deletion_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    property_id TEXT,
    property_type TEXT, -- 'rental' or 'sales'
    action TEXT, -- 'attempt', 'success', 'error'
    error_message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_email TEXT,
    property_title TEXT
);

-- Check recent deletion attempts
SELECT 
    user_id,
    property_id,
    property_type,
    action,
    error_message,
    timestamp,
    user_email,
    property_title
FROM public.deletion_logs 
ORDER BY timestamp DESC 
LIMIT 10;

-- Check properties table structure for any issues
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sales_listings table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sales_listings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS policies on both tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('properties', 'sales_listings') 
ORDER BY tablename, policyname;

-- Test query that delete function uses
SELECT 
    p.id,
    p.user_id,
    p.listing_title,
    pr.full_name,
    pr.email
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id
WHERE p.id = 'test-property-id' -- Replace with actual property ID when testing
LIMIT 1;

-- Check for any rental applications that might block deletion
SELECT 
    id,
    property_id,
    full_name,
    status,
    created_at
FROM rental_applications 
WHERE property_id = 'test-property-id' -- Replace with actual property ID when testing
ORDER BY created_at DESC;

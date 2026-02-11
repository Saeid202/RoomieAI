-- Check property owners and their names
-- Run this in Supabase SQL Editor to see if property owners have names

-- First, check properties table
SELECT 
    p.id as property_id,
    p.listing_title,
    p.user_id as owner_id,
    pr.full_name as owner_name,
    pr.email as owner_email
FROM properties p
LEFT JOIN profiles pr ON p.user_id = pr.id
LIMIT 10;

-- Then check sales_listings table  
SELECT 
    s.id as sales_listing_id,
    s.listing_title,
    s.user_id as owner_id,
    pr.full_name as owner_name,
    pr.email as owner_email
FROM sales_listings s
LEFT JOIN profiles pr ON s.user_id = pr.id
LIMIT 10;

-- Check if profiles table has full_name data
SELECT 
    id,
    full_name,
    email,
    CASE 
        WHEN full_name IS NULL OR full_name = '' THEN 'NO NAME'
        ELSE 'HAS NAME'
    END as name_status
FROM profiles
LIMIT 10;

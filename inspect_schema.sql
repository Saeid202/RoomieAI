-- INVESTIGATE PROFILES SCHEMA
-- Run this in Supabase SQL Editor to see what we are dealing with
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

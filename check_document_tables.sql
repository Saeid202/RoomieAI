-- Check what document access tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%document%access%'
ORDER BY table_name;

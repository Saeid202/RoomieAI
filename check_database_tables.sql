-- Get all tables in the current database
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Get the total count of tables in public schema
SELECT 
    COUNT(*) as total_tables
FROM pg_tables 
WHERE schemaname = 'public';

-- Also check for views
SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- Get the total count of views in public schema
SELECT 
    COUNT(*) as total_views
FROM pg_views 
WHERE schemaname = 'public';

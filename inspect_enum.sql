
SELECT 
    n.nspname AS schema_name,
    t.typname AS type_name,
    e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname = 'user_type' OR t.typname = 'user_role';

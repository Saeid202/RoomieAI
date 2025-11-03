-- Fix the foreign key constraint to use CASCADE delete
-- This script will drop and recreate the foreign key with CASCADE

-- 1. First, let's see what the current constraint looks like
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'rental_applications'
AND tc.table_schema = 'public';

-- 2. Drop the existing foreign key constraint
ALTER TABLE public.rental_applications 
DROP CONSTRAINT IF EXISTS rental_applications_property_id_fkey;

-- 3. Recreate the foreign key constraint with CASCADE delete
ALTER TABLE public.rental_applications 
ADD CONSTRAINT rental_applications_property_id_fkey 
FOREIGN KEY (property_id) 
REFERENCES public.properties(id) 
ON DELETE CASCADE;

-- 4. Verify the new constraint
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'rental_applications'
AND tc.table_schema = 'public';

-- 5. Test message
SELECT 'Foreign key constraint updated to CASCADE delete' as status;

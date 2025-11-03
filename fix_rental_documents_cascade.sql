-- Fix the rental_documents foreign key constraint to use CASCADE delete
-- This will complete the cascade chain: properties -> rental_applications -> rental_documents

-- 1. Check current foreign key constraint
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
AND tc.table_name = 'rental_documents'
AND tc.table_schema = 'public';

-- 2. Drop the existing foreign key constraint
ALTER TABLE public.rental_documents 
DROP CONSTRAINT IF EXISTS rental_documents_application_id_fkey;

-- 3. Recreate the foreign key constraint with CASCADE delete
ALTER TABLE public.rental_documents 
ADD CONSTRAINT rental_documents_application_id_fkey 
FOREIGN KEY (application_id) 
REFERENCES public.rental_applications(id) 
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
AND tc.table_name = 'rental_documents'
AND tc.table_schema = 'public';

-- 5. Test message
SELECT 'Rental documents foreign key constraint updated to CASCADE delete' as status;

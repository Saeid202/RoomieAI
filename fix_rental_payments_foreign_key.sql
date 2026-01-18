-- Fix rental_payments table foreign key relationship
-- This adds the missing foreign key to the profiles table

BEGIN;

-- =====================================================
-- 1. CHECK IF FOREIGN KEY EXISTS
-- =====================================================
DO $$
BEGIN
    -- Check if the foreign key already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'rental_payments_tenant_id_fkey_profiles'
        AND table_name = 'rental_payments'
    ) THEN
        -- Add foreign key constraint to profiles table
        ALTER TABLE rental_payments 
        ADD CONSTRAINT rental_payments_tenant_id_fkey_profiles 
        FOREIGN KEY (tenant_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- =====================================================
-- 2. VERIFY THE FIX
-- =====================================================
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'rental_payments'
    AND kcu.column_name = 'tenant_id';

COMMIT;

SELECT 'rental_payments foreign key fix complete!' as message;

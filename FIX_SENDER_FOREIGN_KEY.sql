-- ============================================
-- FIX SENDER FOREIGN KEY RELATIONSHIP
-- Change sender_id to reference user_profiles instead of auth.users
-- ============================================

-- Step 1: Find and drop the existing foreign key constraint on sender_id
DO $$
DECLARE
    constraint_name_var TEXT;
BEGIN
    -- Find the constraint name
    SELECT tc.constraint_name INTO constraint_name_var
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'mortgage_profile_feedback'
        AND kcu.column_name = 'sender_id';
    
    -- Drop it if it exists
    IF constraint_name_var IS NOT NULL THEN
        EXECUTE format('ALTER TABLE mortgage_profile_feedback DROP CONSTRAINT %I', constraint_name_var);
        RAISE NOTICE 'Dropped constraint: %', constraint_name_var;
    END IF;
END $$;

-- Step 2: Add new foreign key pointing to user_profiles
ALTER TABLE mortgage_profile_feedback
ADD CONSTRAINT mortgage_profile_feedback_sender_id_fkey 
FOREIGN KEY (sender_id) 
REFERENCES user_profiles(id) 
ON DELETE CASCADE;

-- Step 3: Verify the new constraint
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'mortgage_profile_feedback'
    AND kcu.column_name = 'sender_id';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Foreign key updated successfully!';
    RAISE NOTICE 'sender_id now references user_profiles(id) instead of auth.users(id)';
    RAISE NOTICE 'PostgREST can now resolve the relationship';
END $$;

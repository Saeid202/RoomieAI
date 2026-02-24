-- ============================================
-- CHECK SENDER RELATIONSHIP
-- This checks if PostgREST can find the relationship
-- ============================================

-- 1. Check what sender_id references
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

-- 2. Check if auth.users table is accessible
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'auth' 
    AND table_name = 'users'
) AS auth_users_exists;

-- 3. Try to query the relationship that the frontend is using
-- This simulates what PostgREST does
SELECT 
    mpf.id,
    mpf.message,
    mpf.sender_id,
    u.id as user_id,
    u.email as user_email
FROM mortgage_profile_feedback mpf
LEFT JOIN auth.users u ON u.id = mpf.sender_id
LIMIT 1;

-- 4. Check if there's a view or alias for 'sender'
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name = 'sender';

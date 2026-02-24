-- Verify the broker feedback system was set up correctly

-- 1. Check if mortgage_profile_feedback table exists
SELECT 'mortgage_profile_feedback table' as check_name, 
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables 
           WHERE table_name = 'mortgage_profile_feedback'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 2. Check if review columns were added to mortgage_profiles
SELECT 'review_status column' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'mortgage_profiles' AND column_name = 'review_status'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'last_reviewed_at column' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'mortgage_profiles' AND column_name = 'last_reviewed_at'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'last_reviewed_by column' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'mortgage_profiles' AND column_name = 'last_reviewed_by'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 3. Check RLS policies
SELECT 'RLS Policies' as check_name, COUNT(*)::text || ' policies created' as status
FROM pg_policies 
WHERE tablename = 'mortgage_profile_feedback';

-- 4. Check triggers
SELECT 'Triggers' as check_name, COUNT(*)::text || ' triggers created' as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'mortgage_profile_feedback';

-- 5. Check indexes
SELECT 'Indexes' as check_name, COUNT(*)::text || ' indexes created' as status
FROM pg_indexes 
WHERE tablename = 'mortgage_profile_feedback';

-- 6. Show Saeid's mortgage profile with new review fields
SELECT 
    'Saeid Profile Check' as check_name,
    CASE 
        WHEN review_status IS NOT NULL THEN '✅ review_status: ' || review_status
        ELSE '❌ review_status is NULL'
    END as status
FROM mortgage_profiles
WHERE user_id = 'd599e69e-407f-44f4-899d-14a1e3af1103';

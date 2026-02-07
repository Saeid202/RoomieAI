-- Debug Stripe function issues
-- Check if the function exists and its configuration

-- Check Supabase function logs
SELECT 
    function_name,
    status,
    created_at,
    error_message
FROM pg_stat_user_functions 
WHERE function_name LIKE '%manage-financial-connections%'
ORDER BY created_at DESC 
LIMIT 10;

-- Check environment variables (if accessible)
-- Note: This might not return actual values for security
SELECT 
    'STRIPE_SECRET_KEY' as env_var,
    'CONFIGURED' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pg_settings' 
    AND column_name = 'settings'
    AND settings::text LIKE '%STRIPE_SECRET_KEY%'
);

-- Check if the function exists
SELECT 
    proname as function_name,
    prosrc as function_definition
FROM pg_proc 
WHERE proname = 'manage-financial-connections'
OR proname LIKE '%financial%connections%';

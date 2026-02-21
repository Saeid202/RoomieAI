-- Check what columns exist in payment_methods table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'payment_methods'
ORDER BY ordinal_position;

-- Check if there are any existing records
SELECT COUNT(*) as total_records FROM payment_methods;

-- Show sample data if any exists
SELECT * FROM payment_methods LIMIT 5;

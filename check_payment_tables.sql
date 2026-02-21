-- Check which payment tables exist in the database
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('rent_payments', 'rental_payments', 'payment_methods', 'payment_accounts')
ORDER BY table_name;

-- If rental_payments exists, show its columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'rental_payments'
ORDER BY ordinal_position;

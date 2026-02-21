-- Check what columns exist in rental_payments table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'rental_payments'
ORDER BY ordinal_position;

-- Check if there are any existing records
SELECT COUNT(*) as total_records FROM rental_payments;

-- Show sample data if any exists (first 3 records)
SELECT * FROM rental_payments LIMIT 3;

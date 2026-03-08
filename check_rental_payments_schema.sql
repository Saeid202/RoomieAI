-- Check rental_payments table schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'rental_payments'
ORDER BY ordinal_position;

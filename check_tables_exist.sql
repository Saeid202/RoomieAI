-- Quick Check: Verify which payment tables exist
-- Run this first to see what's missing

SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES 
    ('payment_accounts'),
    ('rental_payments'),
    ('payment_methods'),
    ('payment_transactions')
) AS t(table_name);

-- Check if AI Property Assistant tables exist
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
    ('property_document_embeddings'),
    ('ai_property_conversations'),
    ('property_document_processing_status')
) AS t(table_name);

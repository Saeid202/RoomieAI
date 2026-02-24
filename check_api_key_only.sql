-- Check if Gemini API key is set
SELECT 
  'API Key Status' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'GEMINI_API_KEY') 
    THEN '✅ API Key is set'
    ELSE '❌ API Key is MISSING'
  END as status;

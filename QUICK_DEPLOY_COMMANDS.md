# Quick Deploy Commands - OpenAI Migration

## Option 1: Automated Script (Recommended)
```powershell
# Run the deployment script
.\deploy_openai_migration.ps1
```

## Option 2: Manual Commands

### 1. Database Migration
```bash
supabase db push
```

### 2. Set API Key
```bash
supabase secrets set OPENAI_API_KEY=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
```

### 3. Deploy Edge Function
```bash
supabase functions deploy process-property-document-simple
```

### 4. Test (Browser Console)
Copy and paste from `process_document_now.js` into browser console

## Option 3: Manual via Supabase Dashboard

### Database Migration
1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of `supabase/migrations/20260221_migrate_to_openai_embeddings.sql`
3. Paste and run

### API Key
1. Go to Project Settings > Edge Functions
2. Click "Add Secret"
3. Name: `OPENAI_API_KEY`
4. Value: `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`

### Edge Function
1. Go to Edge Functions
2. Click "Deploy new function"
3. Select `process-property-document-simple`
4. Deploy

## Verification Commands

### Check Processing Status
```sql
SELECT 
  document_id,
  status,
  total_chunks,
  processed_chunks,
  error_message
FROM property_document_processing_status
WHERE document_id = '8a22e588-590e-4a59-93c9-d0a5e59af009';
```

### Check Embeddings
```sql
SELECT 
  id,
  document_type,
  chunk_index,
  array_length(embedding::float[], 1) as dimensions,
  substring(content, 1, 100) as preview
FROM property_document_embeddings
WHERE document_id = '8a22e588-590e-4a59-93c9-d0a5e59af009'
ORDER BY chunk_index
LIMIT 5;
```

### Check Edge Function Logs
```bash
supabase functions logs process-property-document-simple
```

## Troubleshooting

### Supabase CLI Not Found
```bash
# Install Supabase CLI
npm install -g supabase
# or
scoop install supabase
```

### Not Logged In
```bash
supabase login
```

### Project Not Linked
```bash
supabase link --project-ref bjesofgfbuyzjamyliys
```

### API Key Invalid
Test with curl:
```bash
curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"
```

## What's Different Now?

| Aspect | Before (Gemini) | After (OpenAI) |
|--------|----------------|----------------|
| Model | text-embedding-004 | text-embedding-3-small |
| Dimensions | 768 | 1536 |
| API Endpoint | generativelanguage.googleapis.com | api.openai.com |
| Auth | Query param `?key=` | Header `Authorization: Bearer` |
| Cost | Free (but broken) | $0.02 per 1M tokens |
| Status | ❌ 404 NOT_FOUND | ✅ Working |

## Success Indicators

✅ Migration runs without errors
✅ API key is set in Supabase
✅ Edge Function deploys successfully
✅ Test document processes (browser script returns success)
✅ Embeddings appear in database with 1536 dimensions
✅ Processing status shows "completed"

## Ready to Deploy?

Choose your method above and follow the steps. Full documentation in `OPENAI_MIGRATION_DEPLOYMENT.md`.

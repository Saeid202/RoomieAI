# OpenAI Migration - Deployment Steps

## Summary
Migrated from Gemini (768 dimensions) to OpenAI (1536 dimensions) for document embeddings.

## Changes Made

### 1. Edge Function Updated
- File: `supabase/functions/process-property-document-simple/index.ts`
- Changed API endpoint from Gemini to OpenAI
- Model: `text-embedding-3-small` (1536 dimensions)
- API Key: Uses `OPENAI_API_KEY` environment variable

### 2. Database Migration Created
- File: `supabase/migrations/20260221_migrate_to_openai_embeddings.sql`
- Updates vector dimensions from 768 to 1536
- Deletes test embeddings
- Recreates indexes
- Updates search function
- Resets processing statuses to pending

## Deployment Steps

### Step 1: Run Database Migration
```bash
# Navigate to your project root
cd [your-project-path]

# Run the migration
supabase db push
```

Or run manually in Supabase SQL Editor:
```sql
-- Copy and paste contents of:
-- supabase/migrations/20260221_migrate_to_openai_embeddings.sql
```

### Step 2: Set OpenAI API Key in Supabase
```bash
# Set the secret
supabase secrets set OPENAI_API_KEY=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
```

Or set manually in Supabase Dashboard:
1. Go to Project Settings > Edge Functions
2. Add secret: `OPENAI_API_KEY` = `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`

### Step 3: Deploy Edge Function
```bash
# Deploy the updated function
supabase functions deploy process-property-document-simple
```

### Step 4: Test Document Processing
Run this in your browser console (on your app page):

```javascript
// Test document processing with OpenAI
(async function() {
  console.log('🚀 Testing OpenAI Document Processing...\n');
  
  const token = JSON.parse(localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token'))?.access_token;
  
  if (!token) {
    console.error('❌ Not authenticated');
    return;
  }

  const documentId = '8a22e588-590e-4a59-93c9-d0a5e59af009';
  const propertyId = 'db8e5787-a221-4381-a148-9aa360b474a4';
  const documentUrl = 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/db8e5787-a221-4381-a148-9aa360b474a4/title_deed_1771717270702.pdf';
  const documentType = 'title_deed';

  console.log('📄 Document ID:', documentId);
  console.log('🏠 Property ID:', propertyId);
  console.log('\n⏳ Calling Edge Function...\n');

  try {
    const response = await fetch(
      'https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/process-property-document-simple',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentId,
          propertyId,
          documentUrl,
          documentType
        })
      }
    );

    console.log('📡 Response Status:', response.status, response.statusText);
    
    const result = await response.json();
    console.log('📦 Response Body:', result);
    
    if (response.ok && result.success) {
      console.log('\n✅ SUCCESS WITH OPENAI!');
      console.log('   Chunks Processed:', result.chunksProcessed);
      console.log('   Category:', result.category);
      console.log('\n🎉 Document processed! AI is now ready.');
    } else {
      console.error('\n❌ FAILED:', result.error);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
})();
```

### Step 5: Verify Embeddings
Check that embeddings were created:

```sql
-- Check processing status
SELECT 
  document_id,
  status,
  total_chunks,
  processed_chunks,
  error_message
FROM property_document_processing_status
WHERE document_id = '8a22e588-590e-4a59-93c9-d0a5e59af009';

-- Check embeddings (should show 1536 dimensions)
SELECT 
  id,
  document_type,
  chunk_index,
  array_length(embedding::float[], 1) as embedding_dimensions,
  substring(content, 1, 100) as content_preview
FROM property_document_embeddings
WHERE document_id = '8a22e588-590e-4a59-93c9-d0a5e59af009'
ORDER BY chunk_index
LIMIT 5;
```

### Step 6: Re-enable Auto-Trigger (Optional)
Once confirmed working, re-enable auto-trigger in:
`src/services/aiPropertyAssistantService.ts` (lines 250-260)

## What Changed

### API Differences

**Gemini (Old):**
```typescript
// Endpoint
https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}

// Request
{
  "model": "models/text-embedding-004",
  "content": {
    "parts": [{ "text": "..." }]
  }
}

// Response
{
  "embedding": {
    "values": [0.1, 0.2, ...]  // 768 dimensions
  }
}
```

**OpenAI (New):**
```typescript
// Endpoint
https://api.openai.com/v1/embeddings

// Headers
Authorization: Bearer ${apiKey}

// Request
{
  "model": "text-embedding-3-small",
  "input": "..."
}

// Response
{
  "data": [{
    "embedding": [0.1, 0.2, ...]  // 1536 dimensions
  }]
}
```

## Cost Comparison

### Gemini
- Free tier: 1,500 requests/day
- Paid: Not available for embeddings (API key issue)

### OpenAI
- Cost: $0.02 per 1M tokens
- Example: 100 documents × 10 pages × 500 words = ~500K tokens = $0.01
- Very affordable for this use case

## Troubleshooting

### If deployment fails:
1. Check Supabase CLI is installed: `supabase --version`
2. Check you're logged in: `supabase login`
3. Check project is linked: `supabase link`

### If API key doesn't work:
1. Verify key in Supabase Dashboard > Project Settings > Edge Functions
2. Check key format starts with `sk-proj-`
3. Test key directly: `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`

### If embeddings fail:
1. Check Edge Function logs in Supabase Dashboard
2. Verify PDF is accessible (public URL)
3. Check document isn't an image file

## Next Steps After Successful Deployment

1. ✅ Process the test document
2. ✅ Verify embeddings in database
3. Deploy `ai-property-assistant` Edge Function (chat)
4. Test the chat interface
5. Re-enable auto-trigger for new documents
6. Celebrate! 🎉

## Files Modified
- `supabase/functions/process-property-document-simple/index.ts`
- `supabase/migrations/20260221_ai_property_assistant_setup.sql` (comment only)

## Files Created
- `supabase/migrations/20260221_migrate_to_openai_embeddings.sql`
- `OPENAI_MIGRATION_DEPLOYMENT.md` (this file)

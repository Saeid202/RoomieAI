# ⚠️ OUTDATED - See GEMINI_READY_TO_DEPLOY.md

This file contains outdated information (768 dimensions).

**Use these files instead:**
- `GEMINI_READY_TO_DEPLOY.md` - Quick overview
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step guide
- `GEMINI_FINAL_DEPLOYMENT.md` - Complete technical details

---

# Gemini Deployment - FREE Embeddings! 🎉

## ⚠️ CORRECTION: Dimensions are 3072→2000, not 768!

## Summary
Switched to Gemini for FREE embeddings using your new API key that has embedding access!

## What Changed
- **API:** Google Gemini (FREE!)
- **Model:** `gemini-embedding-001`
- **Dimensions:** 3072 (truncated to 2000)
- **Cost:** $0.00 (completely free!)

## Your New Gemini API Key
```
AIzaSyAKMwr5xp_B0YM5UfcUMVOewJkwMmQNDew
```

This key HAS access to `models/gemini-embedding-001` ✅

## Deployment Steps

### Step 1: Run Database Migration
```bash
supabase db push
```

This updates the database to use 768 dimensions for Gemini.

### Step 2: Set Gemini API Key in Supabase
Go to Supabase Dashboard:
1. Project Settings > Edge Functions
2. Add Secret:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `AIzaSyAKMwr5xp_B0YM5UfcUMVOewJkwMmQNDew`

Or via CLI:
```bash
supabase secrets set GEMINI_API_KEY=AIzaSyAKMwr5xp_B0YM5UfcUMVOewJkwMmQNDew
```

### Step 3: Deploy Edge Function
```bash
supabase functions deploy process-property-document-simple
```

### Step 4: Test It!
Run this in your browser console (on your app page):

```javascript
(async function() {
  console.log('🚀 Testing Gemini Document Processing...\n');
  
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
      console.log('\n✅ SUCCESS WITH GEMINI!');
      console.log('   Chunks Processed:', result.chunksProcessed);
      console.log('   Category:', result.category);
      console.log('\n🎉 Document processed! AI is now ready. And it\'s FREE!');
    } else {
      console.error('\n❌ FAILED:', result.error);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
})();
```

### Expected Output:
```
✅ SUCCESS WITH GEMINI!
   Chunks Processed: 15
   Category: Legal Identity
🎉 Document processed! AI is now ready. And it's FREE!
```

## Verify Embeddings
Run this in Supabase SQL Editor:

```sql
-- Check embeddings (should show 768 dimensions)
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

-- Check processing status
SELECT 
  document_id,
  status,
  total_chunks,
  processed_chunks,
  error_message
FROM property_document_processing_status
WHERE document_id = '8a22e588-590e-4a59-93c9-d0a5e59af009';
```

## Why Gemini?

### Advantages ✅
- **FREE:** No cost at all!
- **Good Quality:** Gemini embeddings are excellent
- **Fast:** Quick response times
- **Reliable:** Google's infrastructure

### Comparison

| Feature | Gemini | OpenAI |
|---------|--------|--------|
| Cost | FREE | $0.02 per 1M tokens |
| Dimensions | 768 | 1536 |
| Quality | Excellent | Excellent |
| Speed | Fast | Fast |
| Limit | 1,500 requests/day | Pay as you go |

## What Was Fixed

The old API key (`AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0`) didn't have access to embedding models.

The new API key (`AIzaSyAKMwr5xp_B0YM5UfcUMVOewJkwMmQNDew`) DOES have access to:
- ✅ `models/gemini-embedding-001` (embeddings)
- ✅ `models/gemini-2.5-flash` (chat)
- ✅ `models/gemini-2.5-pro` (advanced chat)

## Files Modified
- ✅ `supabase/functions/process-property-document-simple/index.ts` - Reverted to Gemini API
- ✅ `supabase/migrations/20260221_migrate_to_gemini_embeddings.sql` - Updated for 768 dimensions
- ✅ `supabase/migrations/20260221_ai_property_assistant_setup.sql` - Updated vector size

## Next Steps

1. Run `supabase db push`
2. Set `GEMINI_API_KEY` in Supabase
3. Deploy Edge Function
4. Test with browser script
5. Enjoy FREE embeddings! 🎉

## Success Criteria

✅ Database migration completes
✅ API key set in Supabase
✅ Edge Function deploys
✅ Test document processes successfully
✅ Embeddings created with 768 dimensions
✅ Processing status shows "completed"
✅ Cost: $0.00!

---

**Ready to deploy with FREE Gemini embeddings!** 🚀

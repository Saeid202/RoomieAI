# ✅ Gemini Deployment Checklist

## Quick Reference

**API Key:** `AIzaSyAKMwr5xp_B0YM5UfcUMVOewJkwMmQNDew`
**Dimensions:** 3072 → 2000 (truncated)
**Index Type:** IVFFlat
**Cost:** FREE! 🎉

---

## Step-by-Step Deployment

### ☐ Step 1: Database Migration

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Open file: `supabase/migrations/20260221_migrate_to_gemini_embeddings.sql`
4. Copy entire content
5. Paste into SQL Editor
6. Click "Run"
7. Wait for "Success. No rows returned"

**Expected Result:** Migration completes without errors

---

### ☐ Step 2: Set API Key

1. Stay in Supabase Dashboard
2. Go to: Project Settings > Edge Functions
3. Scroll to "Secrets"
4. Click "Add Secret"
5. Enter:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `AIzaSyAKMwr5xp_B0YM5UfcUMVOewJkwMmQNDew`
6. Click "Save"

**Expected Result:** Secret appears in list

---

### ☐ Step 3: Deploy Edge Function

1. Open terminal in your project
2. Run:
   ```bash
   supabase functions deploy process-property-document-simple
   ```
3. Wait for deployment to complete

**Expected Result:** "Deployed function process-property-document-simple"

---

### ☐ Step 4: Test Processing

1. Open your app in browser
2. Make sure you're logged in
3. Open browser console (F12)
4. Copy content from: `test_gemini_processing.js`
5. Paste into console
6. Press Enter
7. Watch the output

**Expected Result:**
```
✅ SUCCESS WITH GEMINI!
   Chunks Processed: 15
   Category: Legal Identity
   Dimensions: 3072 → 2000 (truncated)
🎉 Document processed! AI is now ready. And it's FREE!
```

---

### ☐ Step 5: Verify Embeddings

1. Go back to Supabase Dashboard
2. Open SQL Editor
3. Copy content from: `verify_gemini_embeddings.sql`
4. Paste into SQL Editor
5. Click "Run"
6. Check results

**Expected Results:**
- Query 1: `dimensions` = 2000 ✅
- Query 2: `status` = 'completed' ✅
- Query 4: Index type = 'ivfflat' ✅

---

## Troubleshooting

### Migration Fails

**Error:** "column cannot have more than 2000 dimensions for hnsw index"
- ✅ Fixed! Make sure you're using the updated migration file
- Should use IVFFlat, not HNSW

**Error:** "function search_property_documents already exists"
- Run: `DROP FUNCTION IF EXISTS search_property_documents;`
- Then re-run migration

---

### API Key Issues

**Error:** "GEMINI_API_KEY not configured"
- Go to Supabase Dashboard > Project Settings > Edge Functions
- Verify secret is set
- Try redeploying Edge Function

**Error:** "API key not valid"
- Double-check the key: `AIzaSyAKMwr5xp_B0YM5UfcUMVOewJkwMmQNDew`
- Make sure no extra spaces

---

### Processing Fails

**Error:** "expected 768 dimensions, not 3072"
- ✅ Fixed! Make sure Edge Function is redeployed
- Should truncate to 2000 dimensions

**Error:** "No text could be extracted"
- PDF might be scanned image (not text-based)
- Try a different PDF with selectable text

**Error:** "Failed to download document"
- Check document URL is accessible
- Verify storage bucket is public

---

### Verification Issues

**Embeddings show wrong dimensions**
- Should be 2000, not 768 or 3072
- Re-run migration if needed
- Reprocess document

**Status stuck on "processing"**
- Check Edge Function logs in Supabase Dashboard
- Look for error messages
- Try reprocessing document

---

## Success Indicators

When everything works, you should see:

✅ Migration runs without errors
✅ API key saved in Supabase
✅ Edge Function deploys successfully
✅ Test script shows "SUCCESS WITH GEMINI!"
✅ Embeddings table has records with 2000 dimensions
✅ Processing status shows "completed"
✅ No error messages in logs
✅ Console shows "3072 dims → 2000 dims"

---

## What's Next?

After successful deployment:

1. ✅ Document processing works
2. Deploy chat Edge Function: `ai-property-assistant`
3. Re-enable auto-trigger in `aiPropertyAssistantService.ts`
4. Test chat interface
5. Process more documents
6. Enjoy FREE AI! 🎉

---

## Quick Commands Reference

```bash
# Deploy Edge Function
supabase functions deploy process-property-document-simple

# Check Edge Function logs
supabase functions logs process-property-document-simple

# Set API key (alternative to Dashboard)
supabase secrets set GEMINI_API_KEY=AIzaSyAKMwr5xp_B0YM5UfcUMVOewJkwMmQNDew

# List secrets
supabase secrets list
```

---

## Files Reference

- **Migration:** `supabase/migrations/20260221_migrate_to_gemini_embeddings.sql`
- **Edge Function:** `supabase/functions/process-property-document-simple/index.ts`
- **Test Script:** `test_gemini_processing.js`
- **Verification SQL:** `verify_gemini_embeddings.sql`
- **Full Guide:** `GEMINI_FINAL_DEPLOYMENT.md`

---

**Ready to deploy!** Follow the steps above and you'll have FREE Gemini embeddings working in minutes! 🚀

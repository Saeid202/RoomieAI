# 🚀 Quick Start - Gemini FREE Embeddings

## The Fix

```
Gemini API returns: 3072 dimensions
We truncate to:     2000 dimensions  
Store with:         IVFFlat index
Cost:               $0.00 FREE! 🎉
```

## 3 Steps to Deploy

### 1️⃣ Run Migration (SQL Editor)
```sql
-- Copy/paste: supabase/migrations/20260221_migrate_to_gemini_embeddings.sql
```

### 2️⃣ Set API Key (Dashboard)
```
Project Settings > Edge Functions > Secrets
Name:  GEMINI_API_KEY
Value: AIzaSyAKMwr5xp_B0YM5UfcUMVOewJkwMmQNDew
```

### 3️⃣ Deploy Function (Terminal)
```bash
supabase functions deploy process-property-document-simple
```

## Test It

Copy `test_gemini_processing.js` into browser console.

Expected output:
```
✅ SUCCESS WITH GEMINI!
   Chunks Processed: 15
   Dimensions: 3072 → 2000 (truncated)
🎉 Document processed! AI is now ready. And it's FREE!
```

## Verify It

Run `verify_gemini_embeddings.sql` in SQL Editor.

Expected: `dimensions = 2000` ✅

## Need Help?

- **Step-by-step:** See `DEPLOYMENT_CHECKLIST.md`
- **Full details:** See `GEMINI_FINAL_DEPLOYMENT.md`
- **Overview:** See `GEMINI_READY_TO_DEPLOY.md`

## That's It!

Three steps, FREE embeddings, done! 🎉

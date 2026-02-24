# Set Gemini API Key - Instructions

## The Problem
The Gemini API key is not set in Supabase secrets, which is why document processing fails.

## Solution: Set the API Key

### Option 1: Using Supabase CLI (Recommended)

Open your terminal and run:

```bash
supabase secrets set GEMINI_API_KEY=AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0
```

**Expected output:**
```
Finished supabase secrets set.
```

### Option 2: Using Supabase Dashboard

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/bjesofgfbuyzjamyliys
2. Click "Project Settings" in left sidebar
3. Click "Edge Functions" tab
4. Scroll to "Secrets" section
5. Click "Add new secret"
6. Name: `GEMINI_API_KEY`
7. Value: `AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0`
8. Click "Save"

---

## After Setting the API Key

### Step 1: Verify API Key is Set

Run this in Supabase SQL Editor:
```sql
SELECT 
  'API Key Status' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'GEMINI_API_KEY') 
    THEN '✅ API Key is set'
    ELSE '❌ API Key is MISSING'
  END as status;
```

You should see: `✅ API Key is set`

### Step 2: Deploy Updated Edge Function

```bash
supabase functions deploy process-property-document
```

### Step 3: Reset Document Status

Run in Supabase SQL Editor:
```sql
UPDATE property_document_processing_status
SET 
  status = 'pending',
  error_message = NULL,
  retry_count = 0,
  started_at = NULL,
  completed_at = NULL,
  total_chunks = NULL,
  processed_chunks = NULL
WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f';
```

### Step 4: Process All Documents

Copy the script from `DEPLOY_FIXED_EDGE_FUNCTION.md` (Step 4) and run it in your browser console.

---

## Troubleshooting

### If Supabase CLI is not installed:

**Windows (using Scoop):**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Or download installer:**
https://github.com/supabase/cli/releases

### If you need to login:
```bash
supabase login
```

### If you need to link your project:
```bash
supabase link --project-ref bjesofgfbuyzjamyliys
```

---

## Quick Summary

1. Set API key: `supabase secrets set GEMINI_API_KEY=AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0`
2. Deploy function: `supabase functions deploy process-property-document`
3. Reset status: Run SQL from Step 3 above
4. Process documents: Run browser script from `DEPLOY_FIXED_EDGE_FUNCTION.md`
5. Wait 30 seconds
6. Refresh page - AI should be ready!

**Total time: 2-3 minutes**

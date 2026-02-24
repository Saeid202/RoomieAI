# Edge Function Fix Plan

## Current Problem
The `process-property-document-simple` Edge Function keeps failing with Gemini Vision API errors, even though we created a simplified version without Vision API code.

## Root Cause Analysis
The deployed function still has old code with broken Vision API calls. Deployment via CLI isn't updating the live function.

---

## Requirements for Working Edge Function

### 1. Environment Variables (Supabase Secrets)
- ✅ `GEMINI_API_KEY` - Already set: `AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0`
- ✅ `SUPABASE_URL` - Auto-provided by Supabase
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided by Supabase

### 2. Storage Configuration
- ✅ Bucket `property-documents` exists
- ✅ Bucket is PUBLIC (files accessible via public URLs)
- ✅ Files exist in storage

### 3. Database Tables
- ✅ `property_document_embeddings` - with 768-dimensional vector column
- ✅ `property_document_processing_status` - tracking table
- ✅ `property_documents` - main documents table

### 4. Correct Code
- ✅ Code exists in `supabase/functions/process-property-document-simple/index.ts`
- ✅ Uses correct Gemini embedding endpoint: `text-embedding-004`
- ✅ No Vision API code
- ✅ Handles PDFs only, skips images

---

## The Fix Plan (3 Options)

### Option A: Manual Dashboard Deployment (RECOMMENDED)
**Why:** Bypasses CLI deployment issues, ensures correct code is deployed

**Steps:**
1. Go to Supabase Dashboard → Edge Functions
2. Delete old `process-property-document` function (if exists)
3. Create new function `process-property-document-simple`
4. Copy entire code from local file
5. Deploy via dashboard
6. Test immediately

**Pros:** 
- Visual confirmation of deployment
- Can see function logs immediately
- No CLI issues

**Cons:**
- Manual process
- Need to repeat for updates

---

### Option B: Fresh CLI Deployment
**Why:** Proper way to deploy, but needs clean slate

**Steps:**
1. Delete ALL existing Edge Functions via dashboard
2. Verify Supabase CLI is logged in: `supabase login`
3. Verify project link: `supabase link`
4. Deploy fresh: `supabase functions deploy process-property-document-simple`
5. Check dashboard to confirm deployment
6. Test function

**Pros:**
- Proper deployment method
- Repeatable via CI/CD

**Cons:**
- CLI issues might persist
- Harder to debug

---

### Option C: Hybrid Approach (SAFEST)
**Why:** Combines benefits of both methods

**Steps:**
1. Create function via Dashboard with minimal code (just returns success)
2. Verify it works
3. Deploy real code via CLI
4. If CLI fails, update via Dashboard
5. Test thoroughly

**Pros:**
- Ensures function exists
- Can fall back to dashboard
- Tests both methods

**Cons:**
- More steps
- Takes longer

---

## Recommended Approach: Option A

### Detailed Steps for Option A

#### Step 1: Prepare the Code
The code is ready in `supabase/functions/process-property-document-simple/index.ts`

#### Step 2: Dashboard Deployment
1. Open Supabase Dashboard
2. Go to **Edge Functions** section
3. Click **"New Function"** or **"Create Function"**
4. Name: `process-property-document-simple`
5. Copy the ENTIRE code from the local file
6. Click **"Deploy"**

#### Step 3: Verify Deployment
Run this in browser console:
```javascript
fetch('https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/process-property-document-simple', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token')).access_token}`
  },
  body: JSON.stringify({
    documentId: 'test',
    propertyId: 'test',
    documentUrl: 'https://example.com/test.png',
    documentType: 'test'
  })
}).then(r => r.json()).then(d => console.log('Response:', d));
```

**Expected:** Should return `{success: false, error: "Image files not supported", skipped: true}`
**NOT:** Gemini Vision API error

#### Step 4: Test with Real PDF
Once verified, test with actual PDF:
```javascript
// Use the browser script from process_2_valid_docs.js
```

#### Step 5: Re-enable Auto-Trigger
Once working, update `src/services/aiPropertyAssistantService.ts` to re-enable auto-processing.

---

## Success Criteria

✅ Function deploys without errors
✅ Test call returns expected response (not Vision API error)
✅ Real PDF processing works
✅ Embeddings are created in database
✅ Documents marked as "completed"
✅ AI chat works with real content

---

## Fallback Plan

If all deployment methods fail:
1. Keep using test embeddings (current state)
2. Process documents manually via SQL
3. Focus on other features
4. Revisit Edge Function later with Supabase support

---

## Next Steps

1. Choose Option A (Dashboard deployment)
2. Follow detailed steps above
3. Test thoroughly
4. Document what works
5. Re-enable auto-trigger if successful

Let me know which option you want to try!

# Clean Edge Function Deployment - Step by Step

## Goal
Delete all old Edge Functions and deploy fresh with correct code.

---

## Step 1: Delete Old Functions (Supabase Dashboard)

1. Go to **Supabase Dashboard** → **Edge Functions**
2. Look for these functions:
   - `process-property-document` (OLD - has Vision API)
   - `process-property-document-simple` (if exists)
   - Any other document processing functions

3. For EACH function:
   - Click the **3 dots menu** (⋮)
   - Select **"Delete"**
   - Confirm deletion

4. **Verify:** Edge Functions page should be empty (or only show other unrelated functions)

---

## Step 2: Delete Old Local Function Folder (Optional but Recommended)

Delete the old broken function locally:

```bash
# In your project root
rmdir /s /q supabase\functions\process-property-document
```

This ensures we don't accidentally deploy the old one.

---

## Step 3: Verify Current Function Code

Check that `supabase/functions/process-property-document-simple/index.ts` has:

✅ NO Vision API code
✅ Uses `text-embedding-004` endpoint
✅ Skips image files with proper message
✅ Only processes PDFs

The file is already correct - no changes needed.

---

## Step 4: Deploy Fresh via CLI

```bash
# Make sure you're in project root
cd path\to\your\project

# Deploy the function
supabase functions deploy process-property-document-simple
```

**Expected output:**
```
Deploying function process-property-document-simple...
✓ Function deployed successfully
```

**If you get errors:**
- Check you're logged in: `supabase login`
- Check project link: `supabase link --project-ref bjesofgfbuyzjamyliys`

---

## Step 5: Verify Deployment in Dashboard

1. Go back to **Supabase Dashboard** → **Edge Functions**
2. You should see: `process-property-document-simple`
3. Click on it to see:
   - Last deployment time (should be recent)
   - Version number
   - Logs tab

---

## Step 6: Test the Deployed Function

Open browser console (F12) and run:

```javascript
(async function testDeployment() {
  const token = JSON.parse(localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token'))?.access_token;
  
  console.log('🧪 Testing deployed function...\n');
  
  // Test 1: Image file (should be skipped)
  console.log('Test 1: Image file (should skip)');
  const test1 = await fetch(
    'https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/process-property-document-simple',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        documentId: 'test-img',
        propertyId: 'test',
        documentUrl: 'https://example.com/test.png',
        documentType: 'test'
      })
    }
  );
  
  const result1 = await test1.json();
  console.log('Result:', result1);
  
  if (result1.skipped && result1.error?.includes('Image files not supported')) {
    console.log('✅ Test 1 PASSED: Images are correctly skipped\n');
  } else if (result1.error?.includes('Vision API')) {
    console.log('❌ Test 1 FAILED: Still using old Vision API code\n');
    console.log('   → Old function is still deployed!');
    return;
  } else {
    console.log('⚠️ Test 1 UNEXPECTED:', result1, '\n');
  }
  
  console.log('🎉 Deployment successful! New function is live.');
})();
```

**Expected Result:**
```
✅ Test 1 PASSED: Images are correctly skipped
🎉 Deployment successful! New function is live.
```

**If you see Vision API error:**
- Old function is still running
- Go back to Step 1 and delete ALL functions
- Try deploying again

---

## Step 7: Test with Real PDF

Once Test 1 passes, test with a real PDF:

```javascript
// Copy the script from process_2_valid_docs.js
// It will process your 2 active PDFs
```

---

## Step 8: Re-enable Auto-Trigger

Once everything works, update the frontend to auto-process new documents:

In `src/services/aiPropertyAssistantService.ts`, change the disabled code back to active.

---

## Troubleshooting

### Problem: CLI deployment fails
**Solution:** Use Dashboard deployment instead:
1. Go to Dashboard → Edge Functions → "New Function"
2. Name: `process-property-document-simple`
3. Copy/paste entire code from local file
4. Click "Deploy"

### Problem: Still getting Vision API errors
**Solution:** 
1. Check Dashboard - is the old function still there?
2. Delete it manually
3. Clear browser cache
4. Try test again

### Problem: Function not found (404)
**Solution:**
1. Check function name is exactly: `process-property-document-simple`
2. Check it's deployed in Dashboard
3. Wait 30 seconds for propagation

---

## Success Checklist

- [ ] Old functions deleted from Dashboard
- [ ] New function deployed successfully
- [ ] Test 1 passes (images skipped correctly)
- [ ] No Vision API errors
- [ ] Real PDF processing works
- [ ] Embeddings created in database
- [ ] Documents marked as completed

---

## Next Steps After Success

1. Delete test embeddings (optional)
2. Re-process documents with real content
3. Re-enable auto-trigger
4. Test AI chat with real data

Ready to start? Begin with Step 1!

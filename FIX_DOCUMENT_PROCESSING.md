# Fix Document Processing - Complete Guide

## Current Issue
Documents are stuck in "pending" status with 0 embeddings created after manual Edge Function calls.

## Root Causes Identified

### 1. **Image Files (JPEG/PNG) Cannot Be Processed**
Your uploaded files include:
- `WhatsApp Image 2026-02-08 at 1.20.23 PM.jpeg` (condo_bylaws)
- `Instagram Post - Furry Mate.png` (status_certificate)

The current Edge Function only handles text-based PDFs, NOT images. These need OCR (Optical Character Recognition).

### 2. **Gemini API Key May Not Be Set**
The Edge Function requires `GEMINI_API_KEY` in Supabase secrets.

### 3. **Edge Function May Have Errors**
Check Supabase Dashboard → Edge Functions → Logs for errors.

---

## SOLUTION: Step-by-Step Fix

### Step 1: Check API Key
Run this in Supabase SQL Editor:

```sql
SELECT name FROM vault.secrets WHERE name = 'GEMINI_API_KEY';
```

**If empty**, set the API key:
```bash
supabase secrets set GEMINI_API_KEY=AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0
```

### Step 2: Check Edge Function Logs
1. Go to Supabase Dashboard
2. Click "Edge Functions" in left sidebar
3. Click "process-property-document"
4. Click "Logs" tab
5. Look for error messages from recent calls

**Common errors:**
- `GEMINI_API_KEY not configured` → API key missing
- `Failed to extract text from PDF` → Image file or corrupted PDF
- `Gemini API error: 429` → Rate limit exceeded (15 requests/minute)

### Step 3: Update Edge Function to Handle Images

The current function only handles text PDFs. We need to add OCR support using Gemini's vision model.

**Option A: Use Gemini Vision API (Recommended)**
- Gemini can extract text from images directly
- No additional OCR service needed
- Still FREE with Gemini free tier

**Option B: Skip Image Files for Now**
- Only process PDF files
- Ask user to re-upload images as PDFs

### Step 4: Redeploy Edge Function

After fixing the code:
```bash
supabase functions deploy process-property-document
```

### Step 5: Reset Failed Documents

Run this SQL to reset documents to "pending":
```sql
UPDATE property_document_processing_status
SET 
  status = 'pending',
  error_message = NULL,
  retry_count = 0,
  started_at = NULL,
  completed_at = NULL
WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f';
```

### Step 6: Re-run Manual Processing Script

Use the script from `PROCESS_DOCUMENTS_MANUALLY.md` in browser console.

---

## Quick Fix: Process Only PDFs

If you want to get the AI working NOW with just the PDF files:

### 1. Delete the image files from processing queue:
```sql
DELETE FROM property_document_processing_status
WHERE document_id IN (
  SELECT id FROM property_documents
  WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
    AND (file_name ILIKE '%.jpeg' OR file_name ILIKE '%.jpg' OR file_name ILIKE '%.png')
);
```

### 2. Process only PDFs:
Run this in browser console:
```javascript
(async function processPDFsOnly() {
  const pdfDocuments = [
    {
      documentId: '8f7650f5-8a66-41b5-97f7-00a231c314b7',
      propertyId: '45b129b2-3f36-406f-8fe0-558016bc8f6f',
      documentUrl: 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/45b129b2-3f36-406f-8fe0-558016bc8f6f/survey_plan_1771697217620.pdf',
      documentType: 'survey_plan'
    },
    {
      documentId: '53fafde7-f151-4010-9cb7-4e8c05b8d3b9',
      propertyId: '45b129b2-3f36-406f-8fe0-558016bc8f6f',
      documentUrl: 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/45b129b2-3f36-406f-8fe0-558016bc8f6f/disclosures_1771674558548.pdf',
      documentType: 'disclosures'
    },
    {
      documentId: '798397c1-172a-49cc-95fe-606d5db744dd',
      propertyId: '45b129b2-3f36-406f-8fe0-558016bc8f6f',
      documentUrl: 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/45b129b2-3f36-406f-8fe0-558016bc8f6f/property_tax_bill_1771674539144.pdf',
      documentType: 'property_tax_bill'
    },
    {
      documentId: '126bb32f-d9c2-4ec9-8985-d4362120b5ea',
      propertyId: '45b129b2-3f36-406f-8fe0-558016bc8f6f',
      documentUrl: 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/45b129b2-3f36-406f-8fe0-558016bc8f6f/title_deed_1771674534841.pdf',
      documentType: 'title_deed'
    }
  ];

  for (const doc of pdfDocuments) {
    console.log(`📄 Processing: ${doc.documentType}`);
    
    const response = await fetch('https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/process-property-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token')).access_token}`
      },
      body: JSON.stringify(doc)
    });

    const result = await response.json();
    console.log(response.ok ? '✅' : '❌', result);
    
    await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds between calls
  }
  
  console.log('✅ Done! Refresh page to see results.');
})();
```

---

## Next Steps

1. Run `check_edge_function_setup.sql` to diagnose the issue
2. Check Edge Function logs in Supabase Dashboard
3. If API key is missing, set it
4. If images are the problem, either:
   - Update Edge Function to support images (I can do this)
   - Process only PDFs for now (quick fix above)
5. Re-run processing script

**Let me know what you find in the logs and I'll provide the exact fix!**

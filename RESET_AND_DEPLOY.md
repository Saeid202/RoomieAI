# Reset and Deploy - Simple Steps

## Current Issue
The OLD Edge Function (with broken Vision API) is still running. We need to deploy the NEW simplified function.

---

## Step 1: Reset All Documents to Pending

Run this in Supabase SQL Editor:

```sql
-- Reset ALL documents (including PDFs) to pending
UPDATE property_document_processing_status
SET 
  status = 'pending',
  error_message = NULL,
  retry_count = 0,
  started_at = NULL,
  completed_at = NULL,
  total_chunks = NULL,
  processed_chunks = NULL,
  updated_at = NOW()
WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f';

-- Verify reset
SELECT 
  pd.document_type,
  pd.file_name,
  ps.status
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
  AND pd.deleted_at IS NULL
ORDER BY pd.document_type;
```

**Expected:** All 6 documents show status = 'pending'

---

## Step 2: Deploy NEW Simplified Function

Run in terminal:

```bash
supabase functions deploy process-property-document-simple
```

**Expected output:**
```
Deploying function process-property-document-simple...
✓ Function deployed successfully
```

---

## Step 3: Process ONLY PDFs with NEW Function

Open browser console (F12) and run:

```javascript
(async function processPDFsOnly() {
  console.log('🚀 Processing PDFs with SIMPLIFIED function...');
  
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

  let processed = 0;
  let failed = 0;

  for (const doc of pdfDocuments) {
    try {
      const fileName = doc.documentUrl.split('/').pop();
      console.log(`\n📄 [${processed + 1}/${pdfDocuments.length}] ${doc.documentType}`);
      console.log(`   File: ${fileName}`);
      
      // IMPORTANT: Using the NEW simplified function endpoint
      const response = await fetch('https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/process-property-document-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token')).access_token}`
        },
        body: JSON.stringify({
          documentId: doc.documentId,
          propertyId: doc.propertyId,
          documentUrl: doc.documentUrl,
          documentType: doc.documentType
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log(`   ✅ Success: ${result.chunksProcessed} chunks`);
        processed++;
      } else {
        console.error(`   ❌ Failed: ${result.error}`);
        failed++;
      }

      // Wait 3 seconds between requests
      if (processed + failed < pdfDocuments.length) {
        console.log(`   ⏳ Waiting 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RESULTS:`);
  console.log(`   ✅ Processed: ${processed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📝 Total: ${pdfDocuments.length}`);
  console.log(`${'='.repeat(60)}`);
  
  if (processed > 0) {
    console.log(`\n🎉 Refresh page to see AI Ready status!`);
  }
})();
```

---

## Step 4: Verify Success

Run in Supabase SQL Editor:

```sql
-- Check results
SELECT 
  pd.document_type,
  pd.file_name,
  ps.status,
  ps.total_chunks,
  ps.error_message,
  CASE 
    WHEN ps.status = 'completed' THEN '✅'
    WHEN ps.status = 'failed' THEN '❌'
    WHEN ps.status = 'processing' THEN '🔄'
    ELSE '⏳'
  END as icon
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
  AND pd.deleted_at IS NULL
ORDER BY ps.status, pd.document_type;

-- Check embeddings
SELECT 
  COUNT(*) as total_embeddings,
  COUNT(DISTINCT document_id) as docs_processed
FROM property_document_embeddings
WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f';
```

**Expected:**
- 4 PDFs: status = 'completed' ✅
- 2 images: status = 'pending' or 'failed' (we'll handle later)
- 30-60 embeddings created

---

## If It Still Fails

Check the error message in the results. Common issues:
1. **"too short"** - PDF is scanned image, needs OCR
2. **"non-readable characters"** - PDF is corrupted or encrypted
3. **"Gemini API error"** - API key issue or rate limit

Let me know what error you get and I'll fix it!

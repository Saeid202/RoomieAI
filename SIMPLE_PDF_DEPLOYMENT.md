# Simple PDF Processing - Deployment Guide

## What We're Doing

Processing ONLY the 4 PDF files to get AI working quickly.
- ✅ PDFs: Simple text extraction + Gemini embeddings
- ⏭️ Images: Skipped for now (can add later)

---

## Phase 1: Deploy Simplified Edge Function

### Step 1: Deploy the new function

```bash
supabase functions deploy process-property-document-simple
```

**Expected output:**
```
Deploying function process-property-document-simple...
✓ Function deployed successfully
```

---

## Phase 2: Skip Image Documents

Run this in Supabase SQL Editor:

```sql
-- Mark image documents as "skipped"
UPDATE property_document_processing_status
SET 
  status = 'skipped',
  error_message = 'Image files not supported yet - PDF processing only',
  updated_at = NOW()
WHERE document_id IN (
  SELECT id FROM property_documents
  WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
    AND (file_name ILIKE '%.jpeg' OR file_name ILIKE '%.jpg' OR file_name ILIKE '%.png')
    AND deleted_at IS NULL
);
```

---

## Phase 3: Process PDF Documents

Open browser console (F12) and run:

```javascript
(async function processPDFsOnly() {
  console.log('🚀 Processing PDF documents only...');
  
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
      console.log(`\n📄 Processing ${processed + 1}/${pdfDocuments.length}: ${doc.documentType}`);
      console.log(`   File: ${fileName}`);
      
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

      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ Success: ${result.chunksProcessed} chunks created`);
        processed++;
      } else {
        const error = await response.text();
        console.error(`   ❌ Failed:`, error);
        failed++;
      }

      // Wait 3 seconds between requests
      if (processed + failed < pdfDocuments.length) {
        console.log(`   ⏳ Waiting 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error(`   ❌ Error:`, error.message);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 Processing Complete!`);
  console.log(`   ✅ Processed: ${processed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📝 Total PDFs: ${pdfDocuments.length}`);
  console.log(`${'='.repeat(50)}`);
  
  if (processed > 0) {
    console.log(`\n🎉 Success! Refresh the page to see "AI Ready" status!`);
  } else {
    console.log(`\n⚠️ All documents failed. Check the errors above.`);
  }
})();
```

**Expected time: ~15 seconds for 4 PDFs**

---

## Phase 4: Verify Success

Run this in Supabase SQL Editor:

```sql
-- Check processing status
SELECT 
  pd.document_type,
  pd.file_name,
  ps.status,
  ps.total_chunks,
  ps.processed_chunks,
  CASE 
    WHEN ps.status = 'completed' THEN '✅ Ready'
    WHEN ps.status = 'skipped' THEN '⏭️ Skipped'
    WHEN ps.status = 'processing' THEN '🔄 Processing'
    WHEN ps.status = 'failed' THEN '❌ Failed'
    ELSE '⏳ Pending'
  END as status_display
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
  AND pd.deleted_at IS NULL
ORDER BY ps.status, pd.document_type;

-- Check embeddings created
SELECT 
  COUNT(*) as total_embeddings,
  COUNT(DISTINCT document_id) as documents_processed,
  COUNT(DISTINCT document_type) as document_types,
  COUNT(DISTINCT document_category) as categories
FROM property_document_embeddings
WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f';
```

**Expected results:**
- 4 PDFs with status = 'completed' ✅
- 2 images with status = 'skipped' ⏭️
- 30-60 total embeddings
- 4 documents processed

---

## Phase 5: Test AI Assistant

1. Refresh your browser
2. Go to property's Document Vault
3. 4 PDFs should show "AI Ready" badge
4. 2 images won't show AI badge (skipped)
5. Click "Ask AI" button
6. Try: "What documents do I have?" or "Tell me about the property tax"

---

## Troubleshooting

### If deployment fails:
```bash
supabase login
supabase link --project-ref bjesofgfbuyzjamyliys
supabase functions deploy process-property-document-simple
```

### If processing fails:
1. Check browser console for detailed errors
2. Check Edge Function logs in Supabase Dashboard
3. Verify API key: `SELECT name FROM vault.secrets WHERE name = 'GEMINI_API_KEY';`

### If PDFs fail with "too short" error:
The PDFs might be scanned images, not text-based. We'll need to add OCR support.

---

## What's Next

Once PDFs work:
- ✅ AI Assistant functional with 4 documents
- ✅ Users can ask questions about PDFs
- 🔜 Add image support later with proper OCR

**Total time: 5 minutes**
**Cost: $0.00 (Gemini free tier)**

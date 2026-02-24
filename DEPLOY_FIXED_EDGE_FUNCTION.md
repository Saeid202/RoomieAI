# Deploy Fixed Edge Function - Complete Guide

## What Was Fixed

Updated `process-property-document` Edge Function to handle BOTH PDFs and images:
- ✅ PDFs: Uses Gemini Vision API for accurate text extraction
- ✅ Images (JPEG/PNG): Uses Gemini Vision API with OCR
- ✅ Still FREE with Gemini free tier (1,500 requests/day)

## Deployment Steps

### Step 1: Verify API Key is Set

Run `check_api_key_only.sql` in Supabase SQL Editor.

**If API key is missing**, set it:
```bash
supabase secrets set GEMINI_API_KEY=AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0
```

### Step 2: Deploy Updated Edge Function

```bash
supabase functions deploy process-property-document
```

**Expected output:**
```
Deploying function process-property-document...
✓ Function deployed successfully
```

### Step 3: Reset Document Processing Status

Run this in Supabase SQL Editor:
```sql
-- Reset all documents to pending
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

Copy and paste this script in your browser console (F12):

```javascript
(async function processAllDocuments() {
  console.log('🚀 Starting document processing with image support...');
  
  const documents = [
    // PDFs
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
    },
    // Images (now supported!)
    {
      documentId: 'd5de2d1a-38fe-4b7a-b975-c66242c87539',
      propertyId: '45b129b2-3f36-406f-8fe0-558016bc8f6f',
      documentUrl: 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/45b129b2-3f36-406f-8fe0-558016bc8f6f/condo_bylaws_1771675016699.jpeg',
      documentType: 'condo_bylaws'
    },
    {
      documentId: '2719afff-e2d6-48df-832c-08c5b2625401',
      propertyId: '45b129b2-3f36-406f-8fe0-558016bc8f6f',
      documentUrl: 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/45b129b2-3f36-406f-8fe0-558016bc8f6f/status_certificate_1771675008555.png',
      documentType: 'status_certificate'
    }
  ];

  let processed = 0;
  let failed = 0;

  for (const doc of documents) {
    try {
      console.log(`📄 Processing: ${doc.documentType} (${doc.documentUrl.split('/').pop()})`);
      
      const response = await fetch('https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/process-property-document', {
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
        console.log(`✅ Success: ${doc.documentType}`, result);
        processed++;
      } else {
        const error = await response.text();
        console.error(`❌ Failed: ${doc.documentType}`, error);
        failed++;
      }

      // Wait 5 seconds between requests (Gemini free tier: 15 RPM)
      await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error) {
      console.error(`❌ Error processing ${doc.documentType}:`, error);
      failed++;
    }
  }

  console.log(`\n📊 Processing Complete:`);
  console.log(`   ✅ Processed: ${processed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📝 Total: ${documents.length}`);
  console.log(`\n🔄 Refresh the page to see "AI Ready" status!`);
})();
```

### Step 5: Verify Success

After processing completes (about 30 seconds), run this in Supabase SQL Editor:

```sql
-- Check processing status
SELECT 
  document_type,
  status,
  total_chunks,
  processed_chunks,
  error_message
FROM property_document_processing_status ps
JOIN property_documents pd ON ps.document_id = pd.id
WHERE ps.property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
ORDER BY ps.completed_at DESC;

-- Check embeddings created
SELECT 
  COUNT(*) as total_embeddings,
  COUNT(DISTINCT document_id) as documents_processed,
  COUNT(DISTINCT document_type) as document_types
FROM property_document_embeddings
WHERE property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f';
```

**Expected results:**
- All 6 documents with status = 'completed'
- 50-100+ embeddings created
- 6 documents processed

### Step 6: Test AI Assistant

1. Refresh your browser
2. Documents should show "AI Ready" badge
3. Click "Ask AI" button
4. Try asking: "What documents do I have for this property?"

---

## Troubleshooting

### If deployment fails:
```bash
# Check Supabase CLI is installed
supabase --version

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref bjesofgfbuyzjamyliys
```

### If processing fails:
1. Check Edge Function logs in Supabase Dashboard
2. Verify API key is set: `SELECT name FROM vault.secrets WHERE name = 'GEMINI_API_KEY';`
3. Check rate limits (15 requests/minute for free tier)

### If you see "Rate limit exceeded":
Wait 1 minute and re-run the processing script.

---

## What's Next

Once all documents are processed:
- ✅ AI Assistant will be fully functional
- ✅ Users can ask questions about property documents
- ✅ Citations will link to specific document sections
- ✅ Suggested questions will appear based on available documents

**Total processing time: ~30 seconds for 6 documents**
**Cost: $0.00 (Gemini free tier)**

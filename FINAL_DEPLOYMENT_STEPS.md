# Final Deployment Steps - AI Property Assistant

## ✅ Completed
- API key set in Supabase secrets
- Document processing status reset to "pending"
- Edge Function updated to handle PDFs and images

## 🚀 Next Steps

### Step 1: Deploy Updated Edge Function

Open your terminal and run:

```bash
supabase functions deploy process-property-document
```

**Expected output:**
```
Deploying function process-property-document...
✓ Function deployed successfully
```

If you get an error about not being logged in:
```bash
supabase login
supabase link --project-ref bjesofgfbuyzjamyliys
supabase functions deploy process-property-document
```

---

### Step 2: Process All Documents

Open your browser (where you're logged into RoomieAI), press F12 to open Developer Console, go to the Console tab, and paste this script:

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
      const fileName = doc.documentUrl.split('/').pop();
      console.log(`\n📄 Processing ${processed + 1}/${documents.length}: ${doc.documentType}`);
      console.log(`   File: ${fileName}`);
      
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
        console.log(`   ✅ Success: ${result.chunksProcessed} chunks created`);
        processed++;
      } else {
        const error = await response.text();
        console.error(`   ❌ Failed:`, error);
        failed++;
      }

      // Wait 5 seconds between requests (Gemini free tier: 15 RPM)
      if (processed + failed < documents.length) {
        console.log(`   ⏳ Waiting 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
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
  console.log(`   📝 Total: ${documents.length}`);
  console.log(`${'='.repeat(50)}`);
  
  if (processed > 0) {
    console.log(`\n🎉 Success! Refresh the page to see "AI Ready" status!`);
  } else {
    console.log(`\n⚠️ All documents failed. Check the errors above.`);
  }
})();
```

**Expected output:**
```
🚀 Starting document processing with image support...

📄 Processing 1/6: survey_plan
   File: survey_plan_1771697217620.pdf
   ✅ Success: 15 chunks created
   ⏳ Waiting 5 seconds...

📄 Processing 2/6: disclosures
   File: disclosures_1771674558548.pdf
   ✅ Success: 12 chunks created
   ⏳ Waiting 5 seconds...

... (continues for all 6 documents)

==================================================
📊 Processing Complete!
   ✅ Processed: 6
   ❌ Failed: 0
   📝 Total: 6
==================================================

🎉 Success! Refresh the page to see "AI Ready" status!
```

**Total time: ~30 seconds**

---

### Step 3: Verify Success

After the script completes, run this in Supabase SQL Editor:

```sql
-- Check processing status
SELECT 
  document_type,
  status,
  total_chunks,
  processed_chunks,
  CASE 
    WHEN status = 'completed' THEN '✅'
    WHEN status = 'processing' THEN '🔄'
    WHEN status = 'failed' THEN '❌'
    ELSE '⏳'
  END as icon
FROM property_document_processing_status ps
JOIN property_documents pd ON ps.document_id = pd.id
WHERE ps.property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
ORDER BY ps.completed_at DESC;

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
- 6 documents with status = 'completed' ✅
- 50-100+ total embeddings
- 6 documents processed
- 5-6 document types
- 2-3 categories (Legal Identity, Property Condition, Governance)

---

### Step 4: Test AI Assistant

1. Refresh your browser
2. Go to the property's Document Vault
3. You should see "AI Ready" badges on documents
4. Click the "Ask AI" button (or floating AI button)
5. Try these questions:
   - "What documents do I have for this property?"
   - "Tell me about the property tax information"
   - "What are the condo bylaws?"
   - "Summarize all the legal documents"

---

## 🎉 Success Criteria

You'll know it's working when:
- ✅ All 6 documents show "AI Ready" badge
- ✅ "Ask AI" button is enabled
- ✅ AI responds with relevant information from your documents
- ✅ Citations link to specific documents
- ✅ Suggested questions appear based on your documents

---

## 🐛 Troubleshooting

### If deployment fails:
```bash
# Check if you're logged in
supabase projects list

# If not, login and link
supabase login
supabase link --project-ref bjesofgfbuyzjamyliys
```

### If processing fails:
1. Check browser console for error messages
2. Check Edge Function logs in Supabase Dashboard
3. Verify API key is set: Run `check_api_key_only.sql`

### If you see "Rate limit exceeded":
Wait 1 minute and re-run the processing script. Gemini free tier allows 15 requests/minute.

---

## 📝 What We Fixed

1. ✅ Set Gemini API key in Supabase secrets
2. ✅ Updated Edge Function to handle images using Gemini Vision API
3. ✅ Reset document processing status
4. ✅ Ready to process all 6 documents (4 PDFs + 2 images)

**Cost: $0.00 forever with Gemini free tier**

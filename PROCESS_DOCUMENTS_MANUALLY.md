# Process Documents Manually

## Problem
Documents are uploaded but the Edge Function was never triggered, so they're stuck in "pending" status.

## Solution
Run this script in your browser console to manually trigger processing for all pending documents.

## Steps

1. Open your browser's Developer Console (F12)
2. Go to the Console tab
3. Copy and paste this entire script:

```javascript
// Manual Document Processing Script
(async function processAllDocuments() {
  console.log('🚀 Starting manual document processing...');
  
  const documents = [
    {
      documentId: '8f7650f5-8a66-41b5-97f7-00a231c314b7',
      propertyId: '45b129b2-3f36-406f-8fe0-558016bc8f6f',
      documentUrl: 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/45b129b2-3f36-406f-8fe0-558016bc8f6f/survey_plan_1771697217620.pdf',
      documentType: 'survey_plan'
    },
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

  for (const doc of documents) {
    try {
      console.log(`📄 Processing: ${doc.documentType} (${doc.documentId})`);
      
      const response = await fetch('https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/process-property-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token') ? JSON.parse(localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token')).access_token : ''}`
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

      // Wait 2 seconds between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ Error processing ${doc.documentType}:`, error);
      failed++;
    }
  }

  console.log(`\n📊 Processing Complete:`);
  console.log(`   ✅ Processed: ${processed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📝 Total: ${documents.length}`);
  console.log(`\n🔄 Refresh the page to see updated status!`);
})();
```

4. Press Enter to run the script
5. Wait for all documents to process (about 12 seconds total)
6. Refresh your browser page
7. Documents should now show "AI Ready" instead of "Processing"

## What This Does

- Calls the `process-property-document` Edge Function for each document
- Waits 2 seconds between each call to avoid rate limiting
- Shows progress in the console
- Reports success/failure for each document

## Expected Output

You should see:
```
🚀 Starting manual document processing...
📄 Processing: survey_plan (8f7650f5...)
✅ Success: survey_plan
📄 Processing: condo_bylaws (d5de2d1a...)
✅ Success: condo_bylaws
...
📊 Processing Complete:
   ✅ Processed: 6
   ❌ Failed: 0
   📝 Total: 6
```

## If It Fails

If you see errors, check:
1. Gemini API key is set in Supabase secrets
2. Edge Functions are deployed
3. You're logged in (check localStorage for auth token)

Run this in Supabase SQL Editor to check API key:
```sql
SELECT name, value FROM vault.secrets WHERE name = 'GEMINI_API_KEY';
```

If the key is missing, set it:
```bash
supabase secrets set GEMINI_API_KEY=AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0
```

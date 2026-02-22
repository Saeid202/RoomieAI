// =====================================================
// Process Active Documents - Browser Console Script
// =====================================================
// Copy and paste this entire script into your browser console (F12)
// while logged into your app
// =====================================================

(async function processActiveDocuments() {
  console.log('🚀 Starting AI Document Processing...\n');
  
  const documents = [
    {
      documentId: 'f66bff00-40e6-4b9d-b3dd-20db3d168ee9',
      propertyId: '45b129b2-3f36-406f-8fe0-558016bc8f6f',
      documentUrl: 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/45b129b2-3f36-406f-8fe0-558016bc8f6f/property_tax_bill_1771714598182.pdf',
      documentType: 'property_tax_bill',
      fileName: 'T2.pdf'
    },
    {
      documentId: '95c4adb3-5c05-422f-938d-6c93d6266460',
      propertyId: '45b129b2-3f36-406f-8fe0-558016bc8f6f',
      documentUrl: 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/45b129b2-3f36-406f-8fe0-558016bc8f6f/title_deed_1771714528494.pdf',
      documentType: 'title_deed',
      fileName: 'T1.pdf'
    },
    {
      documentId: '8f7650f5-8a66-41b5-97f7-00a231c314b7',
      propertyId: '45b129b2-3f36-406f-8fe0-558016bc8f6f',
      documentUrl: 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/45b129b2-3f36-406f-8fe0-558016bc8f6f/survey_plan_1771697217620.pdf',
      documentType: 'survey_plan',
      fileName: 'reference_letters.pdf'
    }
  ];

  let processed = 0;
  let failed = 0;
  const results = [];

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 [${i + 1}/${documents.length}] Processing: ${doc.documentType}`);
    console.log(`   File: ${doc.fileName}`);
    console.log(`   ID: ${doc.documentId}`);
    
    try {
      // Get auth token
      const authToken = JSON.parse(localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token'))?.access_token;
      
      if (!authToken) {
        throw new Error('Not authenticated - please log in first');
      }

      // Call the simplified Edge Function
      console.log(`   🔄 Calling Edge Function...`);
      const response = await fetch(
        'https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/process-property-document-simple',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            documentId: doc.documentId,
            propertyId: doc.propertyId,
            documentUrl: doc.documentUrl,
            documentType: doc.documentType
          })
        }
      );

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log(`   ✅ SUCCESS!`);
        console.log(`      - Chunks processed: ${result.chunksProcessed}`);
        console.log(`      - Category: ${result.category}`);
        processed++;
        results.push({
          fileName: doc.fileName,
          status: '✅ SUCCESS',
          chunks: result.chunksProcessed,
          category: result.category
        });
      } else if (result.skipped) {
        console.log(`   ⚠️ SKIPPED: ${result.error}`);
        results.push({
          fileName: doc.fileName,
          status: '⚠️ SKIPPED',
          reason: result.error
        });
      } else {
        console.error(`   ❌ FAILED: ${result.error}`);
        failed++;
        results.push({
          fileName: doc.fileName,
          status: '❌ FAILED',
          error: result.error
        });
      }

      // Wait 3 seconds between requests (respect rate limits)
      if (i < documents.length - 1) {
        console.log(`   ⏳ Waiting 3 seconds before next document...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error(`   ❌ ERROR: ${error.message}`);
      failed++;
      results.push({
        fileName: doc.fileName,
        status: '❌ ERROR',
        error: error.message
      });
    }
  }

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 PROCESSING COMPLETE`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Successful: ${processed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total: ${documents.length}`);
  console.log(`\n📋 DETAILED RESULTS:`);
  console.table(results);
  
  if (processed > 0) {
    console.log(`\n🎉 SUCCESS! AI is now ready for this property!`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Refresh the page`);
    console.log(`   2. Look for "AI Ready" indicator`);
    console.log(`   3. Click "Ask AI" button to test`);
  } else {
    console.log(`\n⚠️ No documents were processed successfully.`);
    console.log(`\nPlease check the errors above and:`);
    console.log(`   1. Verify the PDF files are text-based (not scanned images)`);
    console.log(`   2. Check if files are accessible at their URLs`);
    console.log(`   3. Review Edge Function logs in Supabase Dashboard`);
  }
  
  console.log(`${'='.repeat(60)}\n`);
})();

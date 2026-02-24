// Process the 2 valid documents that exist in storage
(async function process2ValidDocs() {
  console.log('🚀 Processing 2 Valid Documents...\n');
  
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
    }
  ];

  const token = JSON.parse(localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token'))?.access_token;
  
  if (!token) {
    console.error('❌ Not authenticated');
    return;
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 [${i + 1}/${documents.length}] ${doc.documentType}`);
    console.log(`   File: ${doc.fileName}`);
    
    try {
      const response = await fetch(
        'https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/process-property-document-simple',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
        console.log(`      Chunks: ${result.chunksProcessed}`);
        console.log(`      Category: ${result.category}`);
        success++;
      } else {
        console.error(`   ❌ FAILED: ${result.error}`);
        failed++;
      }

      if (i < documents.length - 1) {
        console.log(`   ⏳ Waiting 3 seconds...`);
        await new Promise(r => setTimeout(r, 3000));
      }

    } catch (error) {
      console.error(`   ❌ ERROR: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RESULTS: ✅ ${success} success, ❌ ${failed} failed`);
  console.log(`${'='.repeat(60)}\n`);
  
  if (success > 0) {
    console.log('🎉 AI is now ready! Refresh the page.');
  }
})();

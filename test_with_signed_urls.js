// Test AI processing with signed URLs
(async function testAIProcessing() {
  console.log('🚀 Testing AI Document Processing with Signed URLs...\n');
  
  const docs = [
    {
      id: 'f66bff00-40e6-4b9d-b3dd-20db3d168ee9',
      type: 'property_tax_bill',
      path: '45b129b2-3f36-406f-8fe0-558016bc8f6f/property_tax_bill_1771714598182.pdf'
    },
    {
      id: '95c4adb3-5c05-422f-938d-6c93d6266460',
      type: 'title_deed',
      path: '45b129b2-3f36-406f-8fe0-558016bc8f6f/title_deed_1771714528494.pdf'
    }
  ];

  const propertyId = '45b129b2-3f36-406f-8fe0-558016bc8f6f';
  const token = JSON.parse(localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token'))?.access_token;
  
  if (!token) {
    console.error('❌ Not authenticated');
    return;
  }

  for (const doc of docs) {
    console.log(`\n📄 Processing: ${doc.type}`);
    
    // Get signed URL
    const signedUrlRes = await fetch(
      `https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/sign/property-documents/${doc.path}?expiresIn=3600`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    const { signedURL } = await signedUrlRes.json();
    const fullUrl = `https://bjesofgfbuyzjamyliys.supabase.co${signedURL}`;
    
    console.log(`   🔗 Signed URL obtained`);
    
    // Process document
    const res = await fetch(
      'https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/process-property-document-simple',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentId: doc.id,
          propertyId: propertyId,
          documentUrl: fullUrl,
          documentType: doc.type
        })
      }
    );

    const result = await res.json();
    
    if (res.ok && result.success) {
      console.log(`   ✅ SUCCESS: ${result.chunksProcessed} chunks`);
    } else {
      console.error(`   ❌ FAILED: ${result.error}`);
    }
    
    await new Promise(r => setTimeout(r, 3000));
  }
  
  console.log('\n✅ Done! Refresh page to see AI Ready status.');
})();

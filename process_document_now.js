// Process the document that was just created
// Document ID: 8a22e588-590e-4a59-93c9-d0a5e59af009
(async function() {
  console.log('🚀 Processing Document...\n');
  
  const token = JSON.parse(localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token'))?.access_token;
  
  if (!token) {
    console.error('❌ Not authenticated');
    return;
  }

  const documentId = '8a22e588-590e-4a59-93c9-d0a5e59af009';
  const propertyId = 'db8e5787-a221-4381-a148-9aa360b474a4';
  const documentUrl = 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/db8e5787-a221-4381-a148-9aa360b474a4/title_deed_1771717270702.pdf';
  const documentType = 'title_deed';

  console.log('📄 Document ID:', documentId);
  console.log('🏠 Property ID:', propertyId);
  console.log('📎 File URL:', documentUrl);
  console.log('📋 Type:', documentType);
  console.log('\n⏳ Calling Edge Function...\n');

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
          documentId,
          propertyId,
          documentUrl,
          documentType
        })
      }
    );

    console.log('📡 Response Status:', response.status, response.statusText);
    
    const result = await response.json();
    console.log('📦 Response Body:', result);
    
    if (response.ok && result.success) {
      console.log('\n✅ SUCCESS!');
      console.log('   Chunks Processed:', result.chunksProcessed);
      console.log('   Category:', result.category);
      console.log('\n🎉 Document processed! AI is now ready. Refresh the page.');
    } else {
      console.error('\n❌ FAILED:', result.error);
      
      if (result.error?.includes('Vision API')) {
        console.error('\n⚠️ OLD FUNCTION STILL DEPLOYED!');
        console.error('   The Edge Function needs to be redeployed.');
      } else if (response.status === 404) {
        console.error('\n⚠️ FUNCTION NOT FOUND!');
        console.error('   The Edge Function is not deployed yet.');
      }
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
})();

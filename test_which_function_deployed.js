// Test which version of the function is deployed
(async function testFunctionVersion() {
  const token = JSON.parse(localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token'))?.access_token;
  
  if (!token) {
    console.error('❌ Not authenticated');
    return;
  }

  console.log('🔍 Testing which function is deployed...\n');

  // Test with an image file (should be skipped by new function, fail with Vision API error in old)
  const testPayload = {
    documentId: 'test-123',
    propertyId: '45b129b2-3f36-406f-8fe0-558016bc8f6f',
    documentUrl: 'https://example.com/test.png',
    documentType: 'test'
  };

  try {
    const response = await fetch(
      'https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/process-property-document-simple',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testPayload)
      }
    );

    const result = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Body:', result);
    
    if (result.error && result.error.includes('Vision API')) {
      console.log('\n❌ OLD FUNCTION IS DEPLOYED (has Vision API code)');
      console.log('   You need to deploy the NEW simplified function!');
    } else if (result.skipped || result.error?.includes('Image files not supported')) {
      console.log('\n✅ NEW FUNCTION IS DEPLOYED (skips images correctly)');
    } else {
      console.log('\n⚠️ UNKNOWN RESPONSE - check the output above');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();

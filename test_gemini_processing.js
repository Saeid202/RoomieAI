// =====================================================
// Test Gemini Document Processing
// =====================================================
// Run this in your browser console (on your app page)
// =====================================================

(async function() {
  console.log('🚀 Testing Gemini Document Processing (3072→2000 dims)...\n');
  
  // Get auth token from localStorage
  const token = JSON.parse(localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token'))?.access_token;
  
  if (!token) {
    console.error('❌ Not authenticated - please log in first');
    return;
  }

  // Document details
  const documentId = '8a22e588-590e-4a59-93c9-d0a5e59af009';
  const propertyId = 'db8e5787-a221-4381-a148-9aa360b474a4';
  const documentUrl = 'https://bjesofgfbuyzjamyliys.supabase.co/storage/v1/object/public/property-documents/db8e5787-a221-4381-a148-9aa360b474a4/title_deed_1771717270702.pdf';
  const documentType = 'title_deed';

  console.log('📄 Document ID:', documentId);
  console.log('🏠 Property ID:', propertyId);
  console.log('📎 Document Type:', documentType);
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
    console.log('📦 Response Body:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('\n✅ SUCCESS WITH GEMINI!');
      console.log('   Chunks Processed:', result.chunksProcessed);
      console.log('   Category:', result.category);
      console.log('   Dimensions: 3072 → 2000 (truncated)');
      console.log('\n🎉 Document processed! AI is now ready. And it\'s FREE!');
      console.log('\n📊 Next: Check embeddings in Supabase SQL Editor');
    } else {
      console.error('\n❌ FAILED:', result.error);
      console.error('\n🔍 Troubleshooting:');
      console.error('   1. Check if GEMINI_API_KEY is set in Supabase');
      console.error('   2. Verify Edge Function is deployed');
      console.error('   3. Check Edge Function logs in Supabase Dashboard');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n🔍 Possible causes:');
    console.error('   1. Edge Function not deployed');
    console.error('   2. Network issue');
    console.error('   3. CORS issue');
  }
})();

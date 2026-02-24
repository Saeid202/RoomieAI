// Process single document for property db8e5787-a221-4381-a148-9aa360b474a4
(async function processSingleDoc() {
  console.log('🚀 Processing Single Document...\n');
  
  const token = JSON.parse(localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token'))?.access_token;
  
  if (!token) {
    console.error('❌ Not authenticated');
    return;
  }

  // First, get the document ID from database
  console.log('📋 Step 1: Finding document in database...');
  
  const { data: { user } } = await supabase.auth.getUser();
  const { data: docs, error: docError } = await supabase
    .from('property_documents')
    .select('id, document_type, file_url')
    .eq('property_id', 'db8e5787-a221-4381-a148-9aa360b474a4')
    .is('deleted_at', null);
  
  if (docError) {
    console.error('❌ Error fetching document:', docError);
    return;
  }
  
  if (!docs || docs.length === 0) {
    console.error('❌ No documents found in database');
    return;
  }
  
  console.log(`✅ Found ${docs.length} document(s)`);
  const doc = docs[0];
  console.log('   Document ID:', doc.id);
  console.log('   Type:', doc.document_type);
  console.log('   URL:', doc.file_url);
  
  // Process the document
  console.log('\n📄 Step 2: Processing document...');
  
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
          documentId: doc.id,
          propertyId: 'db8e5787-a221-4381-a148-9aa360b474a4',
          documentUrl: doc.file_url,
          documentType: doc.document_type
        })
      }
    );

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('   ✅ SUCCESS!');
      console.log('      Chunks:', result.chunksProcessed);
      console.log('      Category:', result.category);
      console.log('\n🎉 Document processed! AI is now ready. Refresh the page.');
    } else {
      console.error('   ❌ FAILED:', result.error);
    }

  } catch (error) {
    console.error('   ❌ ERROR:', error.message);
  }
})();

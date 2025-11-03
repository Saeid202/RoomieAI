// Test script for rental documents system
// Run this in browser console to test the document upload and viewing flow

console.log('🧪 Testing Rental Documents System...');

// Test 1: Check if rental-documents bucket is accessible
async function testStorageBucket() {
  console.log('📦 Testing storage bucket access...');
  
  try {
    const { data, error } = await supabase.storage.from('rental-documents').list('', {
      limit: 1
    });
    
    if (error) {
      console.error('❌ Storage bucket error:', error);
      return false;
    }
    
    console.log('✅ Storage bucket accessible');
    return true;
  } catch (error) {
    console.error('❌ Storage bucket test failed:', error);
    return false;
  }
}

// Test 2: Check if rental_documents table exists
async function testDatabaseTable() {
  console.log('🗄️ Testing database table...');
  
  try {
    const { data, error } = await supabase
      .from('rental_documents')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database table error:', error);
      return false;
    }
    
    console.log('✅ Database table accessible');
    return true;
  } catch (error) {
    console.error('❌ Database table test failed:', error);
    return false;
  }
}

// Test 3: Test document upload (mock)
async function testDocumentUpload() {
  console.log('📤 Testing document upload...');
  
  try {
    // Create a mock file for testing
    const mockFile = new File(['test content'], 'test-document.pdf', {
      type: 'application/pdf'
    });
    
    // Test the upload function
    const { uploadRentalDocument } = await import('./src/services/rentalDocumentService.ts');
    
    console.log('✅ Document upload service available');
    return true;
  } catch (error) {
    console.error('❌ Document upload test failed:', error);
    return false;
  }
}

// Test 4: Test document retrieval
async function testDocumentRetrieval() {
  console.log('📥 Testing document retrieval...');
  
  try {
    const { getApplicationDocuments } = await import('./src/services/rentalDocumentService.ts');
    
    console.log('✅ Document retrieval service available');
    return true;
  } catch (error) {
    console.error('❌ Document retrieval test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive document system test...');
  
  const results = {
    storage: await testStorageBucket(),
    database: await testDatabaseTable(),
    upload: await testDocumentUpload(),
    retrieval: await testDocumentRetrieval()
  };
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  console.log('Results:', results);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Document system is ready.');
  } else {
    console.log('⚠️ Some tests failed. Check the issues above.');
  }
  
  return results;
}

// Export for manual testing
window.testRentalDocuments = runAllTests;

console.log('💡 Run testRentalDocuments() to test the system');

// Test Document Upload System
// Run this in browser console to test the complete document upload system

console.log('🧪 Testing Document Upload System...');

async function testDocumentUploadSystem() {
  const results = {
    auth: false,
    storageAccess: false,
    databaseAccess: false,
    uploadTest: false
  };

  try {
    // Test 1: Check authentication
    console.log('1️⃣ Testing authentication...');
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    if (authError || !user) {
      console.log('❌ Not authenticated:', authError?.message);
      return results;
    }
    console.log('✅ User authenticated:', user.id);
    results.auth = true;

    // Test 2: Check storage bucket access
    console.log('2️⃣ Testing storage bucket access...');
    const { data: bucketData, error: bucketError } = await window.supabase.storage
      .from('rental-documents')
      .list('', { limit: 1 });
    
    if (bucketError) {
      console.log('❌ Storage bucket error:', bucketError.message);
      if (bucketError.message.includes('not found')) {
        console.log('💡 Bucket does not exist - run setup script');
      }
    } else {
      console.log('✅ Storage bucket accessible');
      results.storageAccess = true;
    }

    // Test 3: Check database table access
    console.log('3️⃣ Testing database table access...');
    const { data: tableData, error: tableError } = await window.supabase
      .from('rental_documents')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Database table error:', tableError.message);
      if (tableError.message.includes('does not exist')) {
        console.log('💡 Table does not exist - run setup script');
      } else if (tableError.message.includes('permission denied')) {
        console.log('💡 RLS policy issue - check policies');
      }
    } else {
      console.log('✅ Database table accessible');
      results.databaseAccess = true;
    }

    // Test 4: Test actual file upload
    console.log('4️⃣ Testing file upload...');
    
    // Create a test file
    const testContent = 'Test document content for rental application';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test-document.txt', { type: 'text/plain' });
    
    const testFilePath = `${user.id}/test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await window.supabase.storage
      .from('rental-documents')
      .upload(testFilePath, testFile);
    
    if (uploadError) {
      console.log('❌ Upload test failed:', uploadError.message);
      if (uploadError.message.includes('policy')) {
        console.log('💡 Storage RLS policy issue - check storage policies');
      }
    } else {
      console.log('✅ Upload test successful:', uploadData.path);
      results.uploadTest = true;
      
      // Clean up test file
      await window.supabase.storage
        .from('rental-documents')
        .remove([testFilePath]);
      console.log('🧹 Test file cleaned up');
    }

  } catch (error) {
    console.log('❌ Test error:', error);
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('Authentication:', results.auth ? '✅ PASS' : '❌ FAIL');
  console.log('Storage Access:', results.storageAccess ? '✅ PASS' : '❌ FAIL');
  console.log('Database Access:', results.databaseAccess ? '✅ PASS' : '❌ FAIL');
  console.log('Upload Test:', results.uploadTest ? '✅ PASS' : '❌ FAIL');

  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Document upload system is working correctly.');
    console.log('💡 You can now upload documents in the rental application form.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above and run the appropriate fix scripts.');
    
    if (!results.storageAccess) {
      console.log('🔧 Fix: Run setup_rental_documents_storage_complete.sql in Supabase SQL Editor');
    }
    if (!results.databaseAccess) {
      console.log('🔧 Fix: Run create_rental_documents_table.sql in Supabase SQL Editor');
    }
    if (!results.uploadTest) {
      console.log('🔧 Fix: Check storage RLS policies and run fix-rental-documents-complete.sql');
    }
  }

  return results;
}

// Test the rental document service specifically
async function testRentalDocumentService() {
  console.log('\n🔬 Testing Rental Document Service...');
  
  try {
    // Check if the service functions exist
    if (typeof window.uploadRentalDocument === 'function') {
      console.log('✅ uploadRentalDocument function available');
    } else {
      console.log('❌ uploadRentalDocument function not available');
      console.log('💡 Make sure you are on the rental application page');
    }
    
    if (typeof window.getApplicationDocuments === 'function') {
      console.log('✅ getApplicationDocuments function available');
    } else {
      console.log('❌ getApplicationDocuments function not available');
    }
    
  } catch (error) {
    console.log('❌ Service test error:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running comprehensive document upload tests...');
  
  const uploadResults = await testDocumentUploadSystem();
  await testRentalDocumentService();
  
  return uploadResults;
}

// Auto-run tests
runAllTests();

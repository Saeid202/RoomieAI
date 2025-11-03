// Enhanced document upload debugging script
// Run this in browser console during document upload to identify issues

console.log('🔍 Document Upload Debug - Enhanced Diagnostics');

async function debugDocumentUpload() {
  const results = {
    auth: false,
    storageAccess: false,
    databaseAccess: false,
    uploadTest: false,
    applicationExists: false,
    specificErrors: []
  };

  try {
    // Test 1: Check authentication
    console.log('1️⃣ Testing authentication...');
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    if (authError || !user) {
      console.log('❌ Not authenticated:', authError?.message);
      results.specificErrors.push('Authentication failed: ' + (authError?.message || 'No user'));
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
      results.specificErrors.push('Storage error: ' + bucketError.message);
      if (bucketError.message.includes('not found')) {
        console.log('💡 Bucket does not exist - run fix-rental-documents-complete.sql');
      } else if (bucketError.message.includes('policy')) {
        console.log('💡 Storage RLS policy issue - check storage policies');
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
      results.specificErrors.push('Database error: ' + tableError.message);
      if (tableError.message.includes('does not exist')) {
        console.log('💡 Table does not exist - run fix-rental-documents-complete.sql');
      } else if (tableError.message.includes('permission denied')) {
        console.log('💡 RLS policy issue - check database policies');
      }
    } else {
      console.log('✅ Database table accessible');
      results.databaseAccess = true;
    }

    // Test 4: Check if user has any applications
    console.log('4️⃣ Checking for user applications...');
    const { data: applications, error: appError } = await window.supabase
      .from('rental_applications')
      .select('id, full_name, status, created_at')
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (appError) {
      console.log('❌ Applications query error:', appError.message);
      results.specificErrors.push('Applications error: ' + appError.message);
    } else {
      console.log('📋 User applications:', applications);
      if (applications && applications.length > 0) {
        console.log('✅ User has applications');
        results.applicationExists = true;
      } else {
        console.log('⚠️ User has no applications - documents need an application ID');
      }
    }

    // Test 5: Test actual file upload with detailed logging
    console.log('5️⃣ Testing file upload with detailed logging...');
    
    // Create a test file
    const testContent = 'Test document content for rental application debugging';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'debug-test-document.txt', { type: 'text/plain' });
    
    // Use a real application ID if available, otherwise use a test ID
    const testAppId = applications && applications.length > 0 ? applications[0].id : 'test-app-id';
    const testFilePath = `${user.id}/${testAppId}/test/debug-${Date.now()}.txt`;
    
    console.log('📁 Test file details:', {
      name: testFile.name,
      size: testFile.size,
      type: testFile.type,
      appId: testAppId,
      filePath: testFilePath
    });
    
    // Test storage upload
    console.log('☁️ Testing storage upload...');
    const { data: uploadData, error: uploadError } = await window.supabase.storage
      .from('rental-documents')
      .upload(testFilePath, testFile);
    
    if (uploadError) {
      console.log('❌ Upload test failed:', uploadError.message);
      results.specificErrors.push('Upload error: ' + uploadError.message);
      
      if (uploadError.message.includes('policy')) {
        console.log('💡 Storage RLS policy issue - check storage policies');
      } else if (uploadError.message.includes('not found')) {
        console.log('💡 Storage bucket not found - create bucket');
      } else if (uploadError.message.includes('permission')) {
        console.log('💡 Permission denied - check storage policies');
      }
    } else {
      console.log('✅ Upload test successful:', uploadData.path);
      results.uploadTest = true;
      
      // Test database insert
      console.log('💾 Testing database insert...');
      const { data: dbData, error: dbError } = await window.supabase
        .from('rental_documents')
        .insert({
          application_id: testAppId,
          document_type: 'additional',
          original_filename: testFile.name,
          storage_url: `https://your-project.supabase.co/storage/v1/object/public/rental-documents/${testFilePath}`,
          file_size_bytes: testFile.size,
          mime_type: testFile.type,
          description: 'Debug test document',
          status: 'uploaded'
        })
        .select();
      
      if (dbError) {
        console.log('❌ Database insert failed:', dbError.message);
        results.specificErrors.push('Database insert error: ' + dbError.message);
      } else {
        console.log('✅ Database insert successful:', dbData);
      }
      
      // Clean up test file
      console.log('🧹 Cleaning up test files...');
      await window.supabase.storage
        .from('rental-documents')
        .remove([testFilePath]);
      
      if (dbData && dbData.length > 0) {
        await window.supabase
          .from('rental_documents')
          .delete()
          .eq('id', dbData[0].id);
      }
      
      console.log('✅ Test cleanup completed');
    }

  } catch (error) {
    console.log('❌ Debug error:', error);
    results.specificErrors.push('General error: ' + error.message);
  }

  // Enhanced summary
  console.log('\n📊 Enhanced Debug Results:');
  console.log('Authentication:', results.auth ? '✅ PASS' : '❌ FAIL');
  console.log('Storage Access:', results.storageAccess ? '✅ PASS' : '❌ FAIL');
  console.log('Database Access:', results.databaseAccess ? '✅ PASS' : '❌ FAIL');
  console.log('Upload Test:', results.uploadTest ? '✅ PASS' : '❌ FAIL');
  console.log('Applications Exist:', results.applicationExists ? '✅ PASS' : '⚠️ WARNING');

  if (results.specificErrors.length > 0) {
    console.log('\n🚨 Specific Errors Found:');
    results.specificErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  const allPassed = results.auth && results.storageAccess && results.databaseAccess && results.uploadTest;
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Document upload system should work.');
    console.log('💡 If documents still not saving, check the rental application form implementation.');
  } else {
    console.log('\n⚠️ Some tests failed. Issues found:');
    
    if (!results.auth) {
      console.log('🔧 Authentication issue - please log in again');
    }
    if (!results.storageAccess) {
      console.log('🔧 Storage bucket issue - run fix-rental-documents-complete.sql');
    }
    if (!results.databaseAccess) {
      console.log('🔧 Database table issue - run fix-rental-documents-complete.sql');
    }
    if (!results.uploadTest) {
      console.log('🔧 Upload process issue - check storage and database policies');
    }
    if (!results.applicationExists) {
      console.log('🔧 No applications found - create application first before uploading documents');
    }
    
    console.log('\n💡 Run the appropriate fixes and test again.');
  }

  return results;
}

// Test the rental document service specifically
async function testRentalDocumentService() {
  console.log('\n🔬 Testing Rental Document Service Implementation...');
  
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
    
    // Check if Supabase client is available
    if (typeof window.supabase !== 'undefined') {
      console.log('✅ Supabase client available');
    } else {
      console.log('❌ Supabase client not available');
    }
    
  } catch (error) {
    console.log('❌ Service test error:', error);
  }
}

// Monitor document upload attempts
function monitorDocumentUploads() {
  console.log('\n👀 Monitoring document uploads...');
  console.log('💡 Now try uploading a document in the rental application form');
  console.log('💡 Watch this console for detailed upload logs');
  
  // Override console.log to catch upload attempts
  const originalLog = console.log;
  console.log = function(...args) {
    if (args.some(arg => typeof arg === 'string' && arg.includes('upload'))) {
      originalLog('🔍 UPLOAD MONITOR:', ...args);
    }
    originalLog.apply(console, args);
  };
}

// Run all tests
async function runCompleteDebug() {
  console.log('🚀 Running complete document upload debug...');
  
  const uploadResults = await debugDocumentUpload();
  await testRentalDocumentService();
  monitorDocumentUploads();
  
  return uploadResults;
}

// Auto-run debug
runCompleteDebug();

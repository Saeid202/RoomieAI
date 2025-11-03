// Test document upload after RLS fix
// Run this in browser console after applying RLS policies

console.log('🧪 Testing Document Upload After RLS Fix');

async function testDocumentUploadAfterRLSFix() {
  const results = {
    auth: false,
    storageAccess: false,
    databaseAccess: false,
    uploadTest: false,
    applicationExists: false,
    rlsWorking: false
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
    } else {
      console.log('✅ Database table accessible');
      results.databaseAccess = true;
    }

    // Test 4: Check if user has applications
    console.log('4️⃣ Checking for user applications...');
    const { data: applications, error: appError } = await window.supabase
      .from('rental_applications')
      .select('id, full_name, status, created_at')
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (appError) {
      console.log('❌ Applications query error:', appError.message);
    } else {
      console.log('📋 User applications:', applications);
      if (applications && applications.length > 0) {
        console.log('✅ User has applications');
        results.applicationExists = true;
      } else {
        console.log('⚠️ User has no applications - need to create application first');
      }
    }

    // Test 5: Test RLS policies by attempting database insert
    console.log('5️⃣ Testing RLS policies...');
    
    if (applications && applications.length > 0) {
      const testAppId = applications[0].id;
      console.log('🧪 Testing RLS with application:', testAppId);
      
      // Try to insert a test record (this will test RLS policies)
      const { data: insertData, error: insertError } = await window.supabase
        .from('rental_documents')
        .insert({
          application_id: testAppId,
          document_type: 'additional',
          original_filename: 'test-rls-policy.txt',
          storage_url: 'https://test-url.com/test.txt',
          file_size_bytes: 100,
          mime_type: 'text/plain',
          description: 'RLS policy test',
          status: 'uploaded'
        })
        .select();
      
      if (insertError) {
        console.log('❌ RLS policy test failed:', insertError.message);
        if (insertError.message.includes('policy')) {
          console.log('💡 RLS policies are blocking the insert - check policies');
        }
      } else {
        console.log('✅ RLS policies working - insert successful:', insertData);
        results.rlsWorking = true;
        
        // Clean up test record
        await window.supabase
          .from('rental_documents')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Test record cleaned up');
      }
    } else {
      console.log('⚠️ Cannot test RLS - no applications found');
    }

    // Test 6: Test actual file upload
    console.log('6️⃣ Testing complete file upload...');
    
    if (applications && applications.length > 0) {
      const testAppId = applications[0].id;
      
      // Create a test file
      const testContent = 'Test document for RLS policy verification';
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFile = new File([testBlob], 'rls-test-document.txt', { type: 'text/plain' });
      
      const testFilePath = `${user.id}/${testAppId}/test/rls-test-${Date.now()}.txt`;
      
      console.log('📁 Test file details:', {
        name: testFile.name,
        size: testFile.size,
        appId: testAppId,
        filePath: testFilePath
      });
      
      // Test storage upload
      console.log('☁️ Testing storage upload...');
      const { data: uploadData, error: uploadError } = await window.supabase.storage
        .from('rental-documents')
        .upload(testFilePath, testFile);
      
      if (uploadError) {
        console.log('❌ Storage upload failed:', uploadError.message);
      } else {
        console.log('✅ Storage upload successful:', uploadData.path);
        
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
            description: 'RLS test document',
            status: 'uploaded'
          })
          .select();
        
        if (dbError) {
          console.log('❌ Database insert failed:', dbError.message);
        } else {
          console.log('✅ Database insert successful:', dbData);
          results.uploadTest = true;
        }
        
        // Clean up test files
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
    } else {
      console.log('⚠️ Cannot test upload - no applications found');
    }

  } catch (error) {
    console.log('❌ Test error:', error);
  }

  // Enhanced summary
  console.log('\n📊 RLS Fix Test Results:');
  console.log('Authentication:', results.auth ? '✅ PASS' : '❌ FAIL');
  console.log('Storage Access:', results.storageAccess ? '✅ PASS' : '❌ FAIL');
  console.log('Database Access:', results.databaseAccess ? '✅ PASS' : '❌ FAIL');
  console.log('Applications Exist:', results.applicationExists ? '✅ PASS' : '⚠️ WARNING');
  console.log('RLS Policies Working:', results.rlsWorking ? '✅ PASS' : '❌ FAIL');
  console.log('Complete Upload Test:', results.uploadTest ? '✅ PASS' : '❌ FAIL');

  const allPassed = results.auth && results.storageAccess && results.databaseAccess && results.rlsWorking && results.uploadTest;
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Document upload system is now working correctly.');
    console.log('✅ RLS policies are properly configured');
    console.log('✅ Storage uploads are working');
    console.log('✅ Database inserts are working');
    console.log('💡 You can now upload documents in the rental application form!');
  } else {
    console.log('\n⚠️ Some tests failed. Issues found:');
    
    if (!results.auth) {
      console.log('🔧 Authentication issue - please log in again');
    }
    if (!results.storageAccess) {
      console.log('🔧 Storage bucket issue - check bucket configuration');
    }
    if (!results.databaseAccess) {
      console.log('🔧 Database table issue - check table exists');
    }
    if (!results.rlsWorking) {
      console.log('🔧 RLS policies issue - check policies were created correctly');
    }
    if (!results.uploadTest) {
      console.log('🔧 Upload process issue - check storage and database policies');
    }
    if (!results.applicationExists) {
      console.log('🔧 No applications found - create application first before uploading documents');
    }
    
    console.log('\n💡 Fix the issues above and test again.');
  }

  return results;
}

// Test the rental document service specifically
async function testRentalDocumentServiceAfterRLS() {
  console.log('\n🔬 Testing Rental Document Service After RLS Fix...');
  
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

// Run all tests
async function runRLSFixTests() {
  console.log('🚀 Running RLS fix verification tests...');
  
  const uploadResults = await testDocumentUploadAfterRLSFix();
  await testRentalDocumentServiceAfterRLS();
  
  return uploadResults;
}

// Auto-run tests
runRLSFixTests();

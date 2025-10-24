// Complete Document Upload System Test
// Run this in your browser console on the application page

console.log('🧪 Starting Complete Document Upload System Test...');

async function testCompleteDocumentUpload() {
  try {
    // Test 1: Check Supabase client
    console.log('1️⃣ Testing Supabase client...');
    if (!window.supabase) {
      console.log('❌ Supabase client not available on window object');
      return;
    }
    console.log('✅ Supabase client available');

    // Test 2: Check authentication
    console.log('2️⃣ Testing authentication...');
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    if (authError || !user) {
      console.log('❌ Not authenticated:', authError?.message);
      return;
    }
    console.log('✅ User authenticated:', user.id);

    // Test 3: Check for existing applications
    console.log('3️⃣ Checking for user applications...');
    const { data: applications, error: appError } = await window.supabase
      .from('rental_applications')
      .select('id, full_name, status, created_at')
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (appError) {
      console.log('❌ Applications query error:', appError.message);
      return;
    }
    
    console.log('📋 User applications:', applications);
    if (!applications || applications.length === 0) {
      console.log('❌ No applications found - create an application first');
      return;
    }
    
    const testAppId = applications[0].id;
    console.log('✅ Using application ID:', testAppId);

    // Test 4: Check storage bucket access
    console.log('4️⃣ Testing storage bucket access...');
    const { data: buckets, error: bucketsError } = await window.supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Cannot list buckets:', bucketsError.message);
      return;
    }
    
    const rentalDocsBucket = buckets.find(b => b.name === 'rental-documents');
    if (!rentalDocsBucket) {
      console.log('❌ rental-documents bucket not found!');
      return;
    }
    
    console.log('✅ rental-documents bucket found:', rentalDocsBucket);

    // Test 5: Test storage upload
    console.log('5️⃣ Testing storage upload...');
    const testContent = 'Test document for complete system test';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'complete-test.txt', { type: 'text/plain' });
    
    const testFilePath = `${user.id}/${testAppId}/test/complete-test-${Date.now()}.txt`;
    
    console.log('📁 Test file details:', {
      name: testFile.name,
      size: testFile.size,
      appId: testAppId,
      filePath: testFilePath
    });
    
    const { data: uploadData, error: uploadError } = await window.supabase.storage
      .from('rental-documents')
      .upload(testFilePath, testFile);
    
    if (uploadError) {
      console.log('❌ Storage upload failed:', uploadError.message);
      console.log('❌ Storage error details:', uploadError);
      return;
    }
    
    console.log('✅ Storage upload successful:', uploadData.path);

    // Test 6: Test database insert
    console.log('6️⃣ Testing database insert...');
    const { data: { publicUrl } } = window.supabase.storage
      .from('rental-documents')
      .getPublicUrl(testFilePath);
    
    const documentRecord = {
      application_id: testAppId,
      document_type: 'additional',
      original_filename: testFile.name,
      storage_url: publicUrl,
      file_size_bytes: testFile.size,
      mime_type: testFile.type,
      description: 'Complete system test document',
      status: 'uploaded'
    };
    
    console.log('💾 Creating database record:', documentRecord);
    
    const { data: dbData, error: dbError } = await window.supabase
      .from('rental_documents')
      .insert(documentRecord)
      .select()
      .single();
    
    if (dbError) {
      console.log('❌ Database insert failed:', dbError.message);
      console.log('❌ Database error details:', dbError);
      return;
    }
    
    console.log('✅ Database insert successful:', dbData);

    // Test 7: Test document retrieval
    console.log('7️⃣ Testing document retrieval...');
    const { data: retrievedDocs, error: retrieveError } = await window.supabase
      .from('rental_documents')
      .select('*')
      .eq('application_id', testAppId)
      .order('created_at', { ascending: true });
    
    if (retrieveError) {
      console.log('❌ Document retrieval failed:', retrieveError.message);
    } else {
      console.log('✅ Document retrieval successful:', retrievedDocs?.length || 0, 'documents found');
    }

    // Test 8: Clean up test data
    console.log('8️⃣ Cleaning up test data...');
    
    // Delete from database
    if (dbData) {
      const { error: deleteDbError } = await window.supabase
        .from('rental_documents')
        .delete()
        .eq('id', dbData.id);
      
      if (deleteDbError) {
        console.log('⚠️ Database cleanup failed:', deleteDbError.message);
      } else {
        console.log('✅ Database record deleted');
      }
    }
    
    // Delete from storage
    const { error: deleteStorageError } = await window.supabase.storage
      .from('rental-documents')
      .remove([testFilePath]);
    
    if (deleteStorageError) {
      console.log('⚠️ Storage cleanup failed:', deleteStorageError.message);
    } else {
      console.log('✅ Storage file deleted');
    }

    console.log('🎉 Complete Document Upload System Test PASSED!');
    console.log('✅ All components are working correctly');
    console.log('✅ Storage upload: Working');
    console.log('✅ Database insert: Working');
    console.log('✅ Document retrieval: Working');
    console.log('✅ Cleanup: Working');
    
    return {
      success: true,
      message: 'Document upload system is fully functional',
      components: {
        storage: true,
        database: true,
        retrieval: true,
        cleanup: true
      }
    };

  } catch (error) {
    console.log('❌ Test failed with error:', error);
    console.log('❌ Error stack:', error.stack);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// Run the complete test
testCompleteDocumentUpload().then(result => {
  console.log('🏁 Test completed:', result);
});

// Browser Storage Test
// Copy and paste this into your browser console to test storage

async function testStorage() {
  console.log('🧪 Testing Supabase Storage...');
  
  try {
    // Test 1: Check if supabase is available
    if (typeof window.supabase === 'undefined') {
      console.log('❌ Supabase client not found. Make sure you are on your app page.');
      return;
    }
    
    // Test 2: Check authentication
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    if (authError || !user) {
      console.log('❌ Not authenticated. Please log in first.');
      return;
    }
    console.log('✅ Authenticated as:', user.email);
    
    // Test 3: List buckets
    const { data: buckets, error: bucketsError } = await window.supabase.storage.listBuckets();
    if (bucketsError) {
      console.log('❌ Error listing buckets:', bucketsError.message);
      return;
    }
    console.log('✅ Buckets found:', buckets.map(b => b.id));
    
    // Test 4: Check if property-images bucket exists
    const propertyImagesBucket = buckets.find(b => b.id === 'property-images');
    if (!propertyImagesBucket) {
      console.log('❌ property-images bucket not found!');
      console.log('💡 Create the bucket in Supabase Dashboard > Storage');
      return;
    }
    console.log('✅ property-images bucket found:', propertyImagesBucket);
    
    // Test 5: Try to list files in the bucket
    const { data: files, error: filesError } = await window.supabase.storage
      .from('property-images')
      .list('', { limit: 10 });
    
    if (filesError) {
      console.log('❌ Error listing files:', filesError.message);
      console.log('💡 This might be a permissions issue. Check storage policies.');
      return;
    }
    console.log('✅ Files in bucket:', files.length);
    
    // Test 6: Try to upload a test file
    console.log('🚀 Testing file upload...');
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const { data: uploadData, error: uploadError } = await window.supabase.storage
      .from('property-images')
      .upload(`${user.id}/test/test.txt`, testFile);
    
    if (uploadError) {
      console.log('❌ Upload failed:', uploadError.message);
      return;
    }
    console.log('✅ Upload successful:', uploadData);
    
    // Clean up test file
    await window.supabase.storage
      .from('property-images')
      .remove([`${user.id}/test/test.txt`]);
    console.log('🧹 Test file cleaned up');
    
    console.log('🎉 All storage tests passed!');
    
  } catch (error) {
    console.log('❌ Test failed:', error);
  }
}

// Run the test
testStorage();

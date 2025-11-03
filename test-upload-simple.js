// Simple upload test
// Copy and paste this into your browser console

async function testSimpleUpload() {
  console.log('🧪 Testing simple image upload...');
  
  try {
    // Check if we're on the right page
    if (typeof window.supabase === 'undefined') {
      console.log('❌ Supabase not found. Make sure you are on your app page.');
      return;
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    if (authError || !user) {
      console.log('❌ Not authenticated. Please log in first.');
      return;
    }
    console.log('✅ Authenticated as:', user.email);
    
    // Check storage bucket
    const { data: buckets, error: bucketsError } = await window.supabase.storage.listBuckets();
    if (bucketsError) {
      console.log('❌ Error listing buckets:', bucketsError.message);
      return;
    }
    
    const propertyImagesBucket = buckets.find(b => b.id === 'property-images');
    if (!propertyImagesBucket) {
      console.log('❌ property-images bucket not found!');
      console.log('💡 Run the setup-storage-bucket.sql script in Supabase SQL Editor');
      return;
    }
    console.log('✅ property-images bucket found');
    
    // Create a simple test file
    const testContent = 'Hello, this is a test file for image upload';
    const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' });
    
    console.log('🚀 Attempting to upload test file...');
    
    // Try to upload
    const { data, error } = await window.supabase.storage
      .from('property-images')
      .upload(`${user.id}/test/test-upload.txt`, testFile);
    
    if (error) {
      console.log('❌ Upload failed:', error.message);
      console.log('Error details:', error);
      return;
    }
    
    console.log('✅ Upload successful!');
    console.log('Upload data:', data);
    
    // Get the public URL
    const { data: { publicUrl } } = window.supabase.storage
      .from('property-images')
      .getPublicUrl(`${user.id}/test/test-upload.txt`);
    
    console.log('📎 Public URL:', publicUrl);
    
    // Clean up
    const { error: deleteError } = await window.supabase.storage
      .from('property-images')
      .remove([`${user.id}/test/test-upload.txt`]);
    
    if (deleteError) {
      console.log('⚠️ Could not clean up test file:', deleteError.message);
    } else {
      console.log('🧹 Test file cleaned up');
    }
    
    console.log('🎉 Upload test completed successfully!');
    
  } catch (error) {
    console.log('❌ Test failed:', error);
  }
}

// Run the test
testSimpleUpload();

// Quick storage test - run this in browser console after the fix
// This will test if the storage bucket exists and is accessible

async function quickStorageTest() {
  console.log('🧪 Quick storage test...');
  
  try {
    // Test 1: Check if supabase is now available
    if (typeof window.supabase === 'undefined') {
      console.log('❌ Supabase still not available. Try refreshing the page.');
      return;
    }
    console.log('✅ Supabase client found');
    
    // Test 2: Check authentication
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    if (authError || !user) {
      console.log('❌ Not authenticated:', authError?.message || 'No user');
      return;
    }
    console.log('✅ User authenticated:', user.email);
    
    // Test 3: Check storage bucket
    const { data: buckets, error: bucketsError } = await window.supabase.storage.listBuckets();
    if (bucketsError) {
      console.log('❌ Error listing buckets:', bucketsError.message);
      return;
    }
    
    console.log('📦 Available buckets:', buckets.map(b => b.id));
    
    const propertyImagesBucket = buckets.find(b => b.id === 'property-images');
    if (!propertyImagesBucket) {
      console.log('❌ property-images bucket not found!');
      console.log('💡 Run this SQL in Supabase SQL Editor:');
      console.log(`
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;
      `);
      return;
    }
    
    console.log('✅ property-images bucket found:', propertyImagesBucket);
    
    // Test 4: Try to list files
    const { data: files, error: filesError } = await window.supabase.storage
      .from('property-images')
      .list('', { limit: 5 });
    
    if (filesError) {
      console.log('❌ Error listing files:', filesError.message);
      return;
    }
    
    console.log('📁 Files in bucket:', files.length);
    
    // Test 5: Try a simple upload
    console.log('🚀 Testing file upload...');
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const { data: uploadData, error: uploadError } = await window.supabase.storage
      .from('property-images')
      .upload(`${user.id}/test/test.txt`, testFile);
    
    if (uploadError) {
      console.log('❌ Upload failed:', uploadError.message);
      return;
    }
    
    console.log('✅ Upload successful!');
    console.log('Upload data:', uploadData);
    
    // Clean up
    await window.supabase.storage
      .from('property-images')
      .remove([`${user.id}/test/test.txt`]);
    console.log('🧹 Test file cleaned up');
    
    console.log('🎉 All tests passed! Image upload should work now.');
    
  } catch (error) {
    console.log('❌ Test failed:', error);
  }
}

// Run the test
quickStorageTest();

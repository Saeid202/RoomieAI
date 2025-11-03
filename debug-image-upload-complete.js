// Complete image upload debugging script
// Copy and paste this into your browser console

async function debugImageUpload() {
  console.log('🔍 Starting complete image upload debug...');
  
  try {
    // Step 1: Check if we're on the right page
    if (typeof window.supabase === 'undefined') {
      console.log('❌ Supabase not found. Make sure you are on your app page and refresh.');
      return;
    }
    console.log('✅ Supabase client found');
    
    // Step 2: Check authentication
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    if (authError || !user) {
      console.log('❌ Not authenticated:', authError?.message || 'No user');
      console.log('💡 Please log in to your app first');
      return;
    }
    console.log('✅ User authenticated:', user.email, '(' + user.id + ')');
    
    // Step 3: Check storage buckets
    console.log('📦 Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await window.supabase.storage.listBuckets();
    if (bucketsError) {
      console.log('❌ Error listing buckets:', bucketsError.message);
      return;
    }
    
    console.log('📦 Available buckets:', buckets.map(b => ({ id: b.id, name: b.name, public: b.public })));
    
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
    
    console.log('✅ property-images bucket found:', {
      id: propertyImagesBucket.id,
      name: propertyImagesBucket.name,
      public: propertyImagesBucket.public,
      file_size_limit: propertyImagesBucket.file_size_limit,
      allowed_mime_types: propertyImagesBucket.allowed_mime_types
    });
    
    // Step 4: Test listing files in bucket
    console.log('📁 Testing file listing...');
    const { data: files, error: filesError } = await window.supabase.storage
      .from('property-images')
      .list('', { limit: 10 });
    
    if (filesError) {
      console.log('❌ Error listing files:', filesError.message);
      console.log('💡 This might be a permissions issue');
      return;
    }
    
    console.log('✅ File listing successful. Found', files.length, 'files');
    
    // Step 5: Test simple file upload
    console.log('🚀 Testing file upload...');
    const testContent = 'Test file for image upload debugging';
    const testFile = new File([testContent], 'debug-test.txt', { type: 'text/plain' });
    
    const testPath = `${user.id}/debug/test-upload.txt`;
    const { data: uploadData, error: uploadError } = await window.supabase.storage
      .from('property-images')
      .upload(testPath, testFile);
    
    if (uploadError) {
      console.log('❌ Upload failed:', uploadError.message);
      console.log('Error details:', uploadError);
      return;
    }
    
    console.log('✅ Upload successful!');
    console.log('Upload data:', uploadData);
    
    // Step 6: Get public URL
    const { data: { publicUrl } } = window.supabase.storage
      .from('property-images')
      .getPublicUrl(testPath);
    
    console.log('📎 Public URL:', publicUrl);
    
    // Step 7: Test image file upload
    console.log('🖼️ Testing image file upload...');
    
    // Create a simple image file (1x1 pixel PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 1, 1);
    
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.log('❌ Could not create test image blob');
        return;
      }
      
      const imageFile = new File([blob], 'test-image.png', { type: 'image/png' });
      const imagePath = `${user.id}/debug/test-image.png`;
      
      const { data: imageUploadData, error: imageUploadError } = await window.supabase.storage
        .from('property-images')
        .upload(imagePath, imageFile);
      
      if (imageUploadError) {
        console.log('❌ Image upload failed:', imageUploadError.message);
        console.log('Error details:', imageUploadError);
      } else {
        console.log('✅ Image upload successful!');
        console.log('Image upload data:', imageUploadData);
        
        const { data: { publicUrl: imageUrl } } = window.supabase.storage
          .from('property-images')
          .getPublicUrl(imagePath);
        
        console.log('🖼️ Image URL:', imageUrl);
      }
      
      // Clean up test files
      console.log('🧹 Cleaning up test files...');
      await window.supabase.storage
        .from('property-images')
        .remove([testPath, imagePath]);
      console.log('✅ Test files cleaned up');
      
      console.log('🎉 All tests completed successfully!');
      console.log('💡 If image upload still doesn\'t work in the app, the issue might be in the ImageUpload component or form integration.');
      
    }, 'image/png');
    
  } catch (error) {
    console.log('❌ Debug failed:', error);
  }
}

// Run the debug
debugImageUpload();

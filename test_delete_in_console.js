// Test Image Deletion Directly in Browser Console
// Copy and paste this entire script into your browser console while on the property edit page

(async function testImageDeletion() {
  console.log('🧪 Starting Image Deletion Test...');
  
  try {
    // Step 1: Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Not logged in or error getting user:', userError);
      return;
    }
    
    console.log('✅ Current User ID:', user.id);
    
    // Step 2: List files in user's property-images folder
    console.log('\n📂 Listing your property images...');
    
    const { data: folders, error: folderError } = await supabase.storage
      .from('property-images')
      .list(user.id, {
        limit: 100,
        offset: 0,
      });
    
    if (folderError) {
      console.error('❌ Error listing folders:', folderError);
      return;
    }
    
    console.log('📁 Folders found:', folders?.length || 0);
    
    if (!folders || folders.length === 0) {
      console.log('⚠️ No property folders found. Upload some images first.');
      return;
    }
    
    // Step 3: List files in first property folder
    const firstFolder = folders[0];
    console.log('\n📂 Checking folder:', firstFolder.name);
    
    const { data: files, error: filesError } = await supabase.storage
      .from('property-images')
      .list(`${user.id}/${firstFolder.name}`, {
        limit: 100,
        offset: 0,
      });
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError);
      return;
    }
    
    console.log('📄 Files found:', files?.length || 0);
    
    if (!files || files.length === 0) {
      console.log('⚠️ No files in this folder.');
      return;
    }
    
    // Step 4: Show file details
    console.log('\n📋 File Details:');
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name}`);
      console.log(`     Size: ${(file.metadata?.size / 1024).toFixed(2)} KB`);
      console.log(`     Path: ${user.id}/${firstFolder.name}/${file.name}`);
    });
    
    // Step 5: Test deletion on first file (COMMENTED OUT FOR SAFETY)
    console.log('\n⚠️ To test deletion, uncomment the code below and run again:');
    console.log('// Uncomment these lines to actually delete the first file:');
    console.log('/*');
    console.log('const testFilePath = `${user.id}/${firstFolder.name}/${files[0].name}`;');
    console.log('console.log("🗑️ Testing deletion of:", testFilePath);');
    console.log('');
    console.log('const { data: deleteData, error: deleteError } = await supabase.storage');
    console.log('  .from("property-images")');
    console.log('  .remove([testFilePath]);');
    console.log('');
    console.log('if (deleteError) {');
    console.log('  console.error("❌ Delete failed:", deleteError);');
    console.log('} else {');
    console.log('  console.log("✅ Delete successful:", deleteData);');
    console.log('}');
    console.log('*/');
    
    // Step 6: Generate public URLs
    console.log('\n🔗 Public URLs:');
    files.slice(0, 3).forEach((file, index) => {
      const filePath = `${user.id}/${firstFolder.name}/${file.name}`;
      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);
      
      console.log(`  ${index + 1}. ${urlData.publicUrl}`);
    });
    
    console.log('\n✅ Test complete! Check the URLs above to see if they match what you see in the UI.');
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
})();

// MANUAL DELETE TEST (run separately if needed)
// Replace the path with an actual file path from the list above
/*
async function manualDeleteTest(filePath) {
  console.log('🗑️ Manual delete test for:', filePath);
  
  const { data, error } = await supabase.storage
    .from('property-images')
    .remove([filePath]);
  
  if (error) {
    console.error('❌ Delete failed:', error);
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error
    });
  } else {
    console.log('✅ Delete successful!');
    console.log('Response:', data);
  }
}

// Example usage:
// manualDeleteTest('your-user-id/property-temp/filename.jpg');
*/

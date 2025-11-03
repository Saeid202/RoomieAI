// Test script for property image upload functionality
// Run this in browser console to test image upload

console.log('🧪 Testing Property Image Upload System...');

// Test 1: Check if Supabase client is available
console.log('1. Checking Supabase client...');
if (typeof window.supabase !== 'undefined') {
  console.log('✅ Supabase client is available');
} else {
  console.log('❌ Supabase client is not available');
  console.log('Please refresh the page and try again');
}

// Test 2: Check property-images storage bucket
console.log('2. Testing property-images storage bucket...');
async function testPropertyImagesBucket() {
  try {
    const { data, error } = await window.supabase.storage
      .from('property-images')
      .list('', { limit: 1 });
    
    if (error) {
      console.log('❌ Property images bucket error:', error.message);
      if (error.message.includes('not found')) {
        console.log('💡 Property images bucket does not exist - need to run setup script');
      }
      return false;
    }
    console.log('✅ Property images bucket accessible');
    return true;
  } catch (err) {
    console.log('❌ Property images bucket test failed:', err);
    return false;
  }
}

// Test 3: Check user authentication
console.log('3. Testing user authentication...');
async function testUserAuth() {
  try {
    const { data: { user }, error } = await window.supabase.auth.getUser();
    
    if (error || !user) {
      console.log('❌ User not authenticated:', error?.message || 'No user');
      return false;
    }
    console.log('✅ User authenticated:', user.id);
    return true;
  } catch (err) {
    console.log('❌ Auth test failed:', err);
    return false;
  }
}

// Test 4: Test image upload function
console.log('4. Testing image upload function...');
async function testImageUploadFunction() {
  try {
    // Check if the upload function exists
    if (typeof window.uploadPropertyImage === 'function') {
      console.log('✅ Upload function available');
      return true;
    } else {
      console.log('❌ Upload function not available');
      console.log('💡 Make sure you are on the property listing page');
      return false;
    }
  } catch (err) {
    console.log('❌ Upload function test failed:', err);
    return false;
  }
}

// Test 5: Test creating a test image file
console.log('5. Testing image file creation...');
function createTestImageFile() {
  try {
    // Create a simple test image (1x1 pixel PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 1, 1);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], 'test-image.png', { type: 'image/png' });
        resolve(file);
      });
    });
  } catch (err) {
    console.log('❌ Test image creation failed:', err);
    return null;
  }
}

// Test 6: Test actual image upload
console.log('6. Testing actual image upload...');
async function testActualImageUpload() {
  try {
    const testFile = await createTestImageFile();
    if (!testFile) {
      console.log('❌ Could not create test image');
      return false;
    }
    
    console.log('📁 Created test image file:', testFile.name, testFile.size, 'bytes');
    
    // Try to upload the test image
    const { data, error } = await window.supabase.storage
      .from('property-images')
      .upload(`test-${Date.now()}.png`, testFile);
    
    if (error) {
      console.log('❌ Image upload failed:', error.message);
      return false;
    }
    
    console.log('✅ Test image uploaded successfully:', data);
    
    // Clean up the test file
    await window.supabase.storage
      .from('property-images')
      .remove([data.path]);
    
    console.log('🧹 Test file cleaned up');
    return true;
  } catch (err) {
    console.log('❌ Image upload test failed:', err);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running comprehensive property image upload tests...');
  
  const results = {
    supabase: typeof window.supabase !== 'undefined',
    bucket: await testPropertyImagesBucket(),
    auth: await testUserAuth(),
    uploadFunction: await testImageUploadFunction(),
    actualUpload: await testActualImageUpload()
  };
  
  console.log('📊 Test Results:', results);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('🎉 All tests passed! Property image upload should work.');
    console.log('💡 You can now upload images in the Property Photos section.');
  } else {
    console.log('❌ Some tests failed. Issues found:');
    
    if (!results.supabase) {
      console.log('🔧 Supabase client issue - refresh the page');
    }
    if (!results.bucket) {
      console.log('☁️ Storage bucket issue - run fix-property-image-upload-complete.sql');
    }
    if (!results.auth) {
      console.log('🔐 Authentication issue - please log in');
    }
    if (!results.uploadFunction) {
      console.log('⚙️ Upload function issue - navigate to property listing page');
    }
    if (!results.actualUpload) {
      console.log('📤 Upload process issue - check storage permissions');
    }
    
    console.log('💡 Fix the issues above and run this test again.');
  }
  
  return results;
}

// Auto-run tests
runAllTests();

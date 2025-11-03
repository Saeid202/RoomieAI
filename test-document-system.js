// Comprehensive test for rental document system
// Run this in browser console to check the current state

console.log('🧪 Testing Rental Document System...');

// Test 1: Check Supabase client
console.log('1. Checking Supabase client...');
if (typeof window.supabase !== 'undefined') {
  console.log('✅ Supabase client available');
} else {
  console.log('❌ Supabase client not available');
  console.log('Please ensure you are on a page that loads Supabase');
}

// Test 2: Check user authentication
console.log('2. Checking user authentication...');
async function checkAuth() {
  try {
    const { data: { user }, error } = await window.supabase.auth.getUser();
    if (error || !user) {
      console.log('❌ User not authenticated:', error?.message || 'No user');
      return false;
    }
    console.log('✅ User authenticated:', user.id);
    return true;
  } catch (err) {
    console.log('❌ Auth check failed:', err);
    return false;
  }
}

// Test 3: Check storage bucket
console.log('3. Checking storage bucket...');
async function checkStorage() {
  try {
    const { data, error } = await window.supabase.storage
      .from('rental-documents')
      .list('', { limit: 1 });
    
    if (error) {
      console.log('❌ Storage bucket error:', error.message);
      if (error.message.includes('not found')) {
        console.log('💡 Storage bucket does not exist - need to run setup script');
      }
      return false;
    }
    console.log('✅ Storage bucket accessible');
    return true;
  } catch (err) {
    console.log('❌ Storage check failed:', err);
    return false;
  }
}

// Test 4: Check database table
console.log('4. Checking database table...');
async function checkDatabase() {
  try {
    const { data, error } = await window.supabase
      .from('rental_documents')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Database table error:', error.message);
      if (error.message.includes('does not exist')) {
        console.log('💡 Database table does not exist - need to run setup script');
      }
      return false;
    }
    console.log('✅ Database table accessible');
    return true;
  } catch (err) {
    console.log('❌ Database check failed:', err);
    return false;
  }
}

// Test 5: Check rental applications table
console.log('5. Checking rental applications table...');
async function checkApplications() {
  try {
    const { data, error } = await window.supabase
      .from('rental_applications')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Rental applications error:', error.message);
      return false;
    }
    console.log('✅ Rental applications table accessible');
    return true;
  } catch (err) {
    console.log('❌ Applications check failed:', err);
    return false;
  }
}

// Test 6: Test document upload function
console.log('6. Testing document upload function...');
async function testUploadFunction() {
  try {
    // Check if the upload function exists
    if (typeof window.uploadRentalDocument === 'function') {
      console.log('✅ Upload function available');
      return true;
    } else {
      console.log('❌ Upload function not available');
      console.log('💡 Make sure you are on the rental application page');
      return false;
    }
  } catch (err) {
    console.log('❌ Upload function test failed:', err);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running comprehensive document system tests...');
  
  const results = {
    auth: await checkAuth(),
    storage: await checkStorage(),
    database: await checkDatabase(),
    applications: await checkApplications(),
    uploadFunction: await testUploadFunction()
  };
  
  console.log('📊 Test Results:', results);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('🎉 All tests passed! Document system is ready.');
    console.log('💡 You can now test document upload in the rental application form.');
  } else {
    console.log('❌ Some tests failed. Issues found:');
    
    if (!results.auth) {
      console.log('🔐 Authentication issue - please log in');
    }
    if (!results.storage) {
      console.log('☁️ Storage bucket issue - run setup_rental_documents_storage_complete.sql');
    }
    if (!results.database) {
      console.log('🗄️ Database table issue - run setup_rental_documents_storage_complete.sql');
    }
    if (!results.applications) {
      console.log('📋 Applications table issue - check rental_applications table exists');
    }
    if (!results.uploadFunction) {
      console.log('⚙️ Upload function issue - navigate to rental application page');
    }
    
    console.log('💡 Fix the issues above and run this test again.');
  }
  
  return results;
}

// Auto-run tests
runAllTests();

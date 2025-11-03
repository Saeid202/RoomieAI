// Test script for rental document upload functionality
// Run this in browser console after navigating to rental application page

console.log('🧪 Testing Rental Document Upload System...');

// Test 1: Check if Supabase client is available
console.log('1. Checking Supabase client availability...');
if (typeof window.supabase !== 'undefined') {
  console.log('✅ Supabase client is available');
} else {
  console.log('❌ Supabase client is not available');
  console.log('Please refresh the page and try again');
}

// Test 2: Check storage bucket access
console.log('2. Testing storage bucket access...');
async function testStorageAccess() {
  try {
    const { data, error } = await window.supabase.storage
      .from('rental-documents')
      .list('', { limit: 1 });
    
    if (error) {
      console.log('❌ Storage access error:', error);
      return false;
    } else {
      console.log('✅ Storage bucket accessible');
      return true;
    }
  } catch (err) {
    console.log('❌ Storage test failed:', err);
    return false;
  }
}

// Test 3: Check database table access
console.log('3. Testing database table access...');
async function testDatabaseAccess() {
  try {
    const { data, error } = await window.supabase
      .from('rental_documents')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Database access error:', error);
      return false;
    } else {
      console.log('✅ Database table accessible');
      return true;
    }
  } catch (err) {
    console.log('❌ Database test failed:', err);
    return false;
  }
}

// Test 4: Check rental applications table
console.log('4. Testing rental applications table...');
async function testRentalApplicationsAccess() {
  try {
    const { data, error } = await window.supabase
      .from('rental_applications')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Rental applications access error:', error);
      return false;
    } else {
      console.log('✅ Rental applications table accessible');
      return true;
    }
  } catch (err) {
    console.log('❌ Rental applications test failed:', err);
    return false;
  }
}

// Test 5: Check user authentication
console.log('5. Testing user authentication...');
async function testUserAuth() {
  try {
    const { data: { user }, error } = await window.supabase.auth.getUser();
    
    if (error || !user) {
      console.log('❌ User not authenticated:', error);
      return false;
    } else {
      console.log('✅ User authenticated:', user.id);
      return true;
    }
  } catch (err) {
    console.log('❌ Auth test failed:', err);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running comprehensive tests...');
  
  const results = {
    storage: await testStorageAccess(),
    database: await testDatabaseAccess(),
    applications: await testRentalApplicationsAccess(),
    auth: await testUserAuth()
  };
  
  console.log('📊 Test Results:', results);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('🎉 All tests passed! Document upload should work.');
    console.log('💡 Try uploading a document in the rental application form.');
  } else {
    console.log('❌ Some tests failed. Check the errors above.');
    console.log('💡 Run the setup_rental_documents_storage_complete.sql script in Supabase SQL Editor.');
  }
  
  return results;
}

// Auto-run tests
runAllTests();

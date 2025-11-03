// Test Supabase configuration
// Run this in your browser console to test the connection

async function testSupabaseConfig() {
  console.log('🧪 Testing Supabase configuration...');
  
  try {
    // Test 1: Check if Supabase client is available
    if (typeof window !== 'undefined' && window.supabase) {
      console.log('✅ Supabase client found in window');
    } else {
      console.log('❌ Supabase client not found in window');
    }
    
    // Test 2: Check environment variables (if accessible)
    console.log('🔍 Checking environment...');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
    
    // Test 3: Try to import and use the client
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing Supabase environment variables');
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      console.log('✅ Supabase client created successfully');
      
      // Test 4: Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.log('❌ Auth error:', authError.message);
      } else if (user) {
        console.log('✅ User authenticated:', user.email);
      } else {
        console.log('⚠️ No user authenticated');
      }
      
      // Test 5: Test storage bucket
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.log('❌ Storage error:', bucketsError.message);
      } else {
        console.log('✅ Storage accessible. Buckets:', buckets.map(b => b.id));
        const propertyImagesBucket = buckets.find(b => b.id === 'property-images');
        if (propertyImagesBucket) {
          console.log('✅ property-images bucket found:', propertyImagesBucket);
        } else {
          console.log('❌ property-images bucket not found');
        }
      }
      
    } catch (importError) {
      console.log('❌ Error importing Supabase:', importError.message);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error);
  }
}

// Run the test
testSupabaseConfig();

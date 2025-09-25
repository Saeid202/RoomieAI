import { supabase } from "@/integrations/supabase/client";

/**
 * Test database connection and table existence
 */
export async function testDatabaseConnection() {
  console.log("🔍 Testing database connection...");
  
  try {
    // Test 1: Check if we can connect to Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("❌ Auth error:", authError);
      return { success: false, error: `Authentication failed: ${authError.message}` };
    }
    console.log("✅ User authenticated:", user?.email);

    // Test 2: Check if rental_applications table exists
    console.log("🔍 Checking rental_applications table...");
    const { data: appData, error: appError } = await supabase
      .from('rental_applications')
      .select('id')
      .limit(1);
    
    if (appError) {
      console.error("❌ rental_applications table error:", appError);
      return { 
        success: false, 
        error: `rental_applications table error: ${appError.message}`,
        details: appError
      };
    }
    console.log("✅ rental_applications table exists");

    // Test 3: Check if rental_documents table exists
    console.log("🔍 Checking rental_documents table...");
    const { data: docData, error: docError } = await supabase
      .from('rental_documents')
      .select('id')
      .limit(1);
    
    if (docError) {
      console.error("❌ rental_documents table error:", docError);
      return { 
        success: false, 
        error: `rental_documents table error: ${docError.message}`,
        details: docError
      };
    }
    console.log("✅ rental_documents table exists");

    // Test 4: Test a simple insert to rental_applications (and rollback)
    console.log("🔍 Testing rental_applications insert...");
    const testData = {
      property_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      applicant_id: user?.id || '00000000-0000-0000-0000-000000000000',
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      occupation: 'Test Occupation',
      monthly_income: 5000,
      contract_signed: false,
      payment_completed: false
      // Note: agree_to_terms column may not exist, so we'll skip it for now
    };

    const { data: insertData, error: insertError } = await supabase
      .from('rental_applications')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.error("❌ Insert test failed:", insertError);
      return { 
        success: false, 
        error: `Insert test failed: ${insertError.message}`,
        details: insertError
      };
    }

    console.log("✅ Insert test successful:", insertData);

    // Clean up test data
    if (insertData?.id) {
      await supabase
        .from('rental_applications')
        .delete()
        .eq('id', insertData.id);
      console.log("🧹 Test data cleaned up");
    }

    return { 
      success: true, 
      message: "All database tests passed!",
      user: user?.email,
      tablesExist: true
    };

  } catch (error) {
    console.error("❌ Database test failed:", error);
    return { 
      success: false, 
      error: `Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Quick test function to call from browser console
 */
export async function quickDatabaseTest() {
  const result = await testDatabaseConnection();
  console.log("🔍 Database Test Result:", result);
  return result;
}

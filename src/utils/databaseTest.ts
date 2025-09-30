import { supabase } from "@/integrations/supabase/client";

/**
 * Test database connection and table existence
 * NOTE: Currently disabled due to TypeScript type generation issues
 */
export async function testDatabaseConnection() {
  console.log("🔍 Database connection test - currently disabled");
  
  try {
    // Test 1: Check if we can connect to Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("❌ Auth error:", authError);
      return { success: false, error: `Authentication failed: ${authError.message}` };
    }
    console.log("✅ User authenticated:", user?.email);

    // Test properties table (which we know exists in types)
    console.log("🔍 Checking properties table...");
    const { data: propData, error: propError } = await supabase
      .from('properties')
      .select('id')
      .limit(1);
    
    if (propError) {
      console.error("❌ properties table error:", propError);
      return { 
        success: false, 
        error: `properties table error: ${propError.message}`,
        details: propError
      };
    }
    console.log("✅ properties table exists");

    return { 
      success: true, 
      message: "Database connection successful!",
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

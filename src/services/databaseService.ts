
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates and initializes database tables and functions needed for the application
 */
export async function initializeDatabase() {
  console.log("Initializing database...");
  // Create the table info function for debugging
  await createTableInfoFunction();
  
  // Ensure the co-owner table exists with correct structure
  await ensureCoOwnerTableExists();
}

/**
 * Creates a function in Supabase to get table information (columns, types)
 * This helps with debugging database structure issues
 */
export async function createTableInfoFunction() {
  try {
    const { error } = await supabase.rpc('get_table_info', { table_name: 'co_owner' });
    
    // If function doesn't exist, create it
    if (error && error.message.includes('does not exist')) {
      console.log("Creating table info function...");
      
      // Create the function using raw SQL
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION get_table_info(table_name text)
          RETURNS TABLE(column_name text, data_type text, is_nullable boolean)
          LANGUAGE SQL
          AS $$
            SELECT 
              column_name::text, 
              data_type::text,
              (is_nullable = 'YES') as is_nullable
            FROM 
              information_schema.columns
            WHERE 
              table_name = $1
              AND table_schema = 'public'
            ORDER BY 
              ordinal_position;
          $$;
        `
      });
      
      if (createError) {
        console.error("Error creating table info function:", createError);
      } else {
        console.log("Table info function created successfully");
      }
    }
  } catch (error) {
    console.error("Error with table info function:", error);
  }
}

/**
 * Ensures that the co_owner table exists with the correct structure
 * This function is called when the application initializes
 */
export async function ensureCoOwnerTableExists() {
  try {
    console.log("Checking co_owner table...");
    
    // Try to access the table to verify it exists
    const { data: tableInfo, error: tableError } = await supabase.rpc('get_table_info', { 
      table_name: 'co_owner' 
    });
    
    if (tableError) {
      console.error("Error checking co_owner table:", tableError);
    } else {
      console.log("co_owner table exists with columns:", tableInfo);
    }
  } catch (error) {
    console.error("Error checking co_owner table existence:", error);
  }
}

/**
 * Saves co-owner profile data to the database
 * @param formData The form data to save
 * @param userId The user ID to associate with this profile
 * @returns The result of the save operation
 */
export async function saveCoOwnerProfile(formData, userId) {
  if (!userId) {
    console.error("Cannot save profile: No user ID provided");
    throw new Error("You must be logged in to save your profile");
  }
  
  try {
    console.log("Saving co-owner profile for user:", userId);
    
    // Map form data to database format
    const dbData = {
      user_id: userId,
      full_name: formData.fullName,
      age: formData.age,
      email: formData.email,
      phone_number: formData.phoneNumber,
      occupation: formData.occupation,
      preferred_location: formData.preferredLocation,
      investment_capacity: formData.investmentCapacity,
      investment_timeline: formData.investmentTimeline,
      property_type: formData.propertyType,
      co_ownership_experience: formData.coOwnershipExperience,
      updated_at: new Date().toISOString(),
    };
    
    console.log("Database data to save:", dbData);
    
    // First check if a profile exists for this user
    const { data: existingProfile, error: fetchError } = await supabase
      .from('co_owner')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (fetchError) {
      console.error("Error checking for existing profile:", fetchError);
      throw new Error("Failed to check for existing profile: " + fetchError.message);
    }
    
    let result;
    
    if (existingProfile) {
      // Update existing profile
      console.log("Updating existing profile with ID:", existingProfile.id);
      result = await supabase
        .from('co_owner')
        .update(dbData)
        .eq('user_id', userId)
        .select();
    } else {
      // Insert new profile
      console.log("Creating new co-owner profile");
      result = await supabase
        .from('co_owner')
        .insert(dbData)
        .select();
    }
    
    if (result.error) {
      console.error("Error saving profile:", result.error);
      throw result.error;
    }
    
    console.log("Profile saved successfully:", result.data);
    return result;
  } catch (error) {
    console.error("Error in saveCoOwnerProfile:", error);
    throw error;
  }
}

/**
 * Fetches co-owner profile data for a user
 * @param userId The user ID to fetch the profile for
 * @returns The profile data
 */
export async function fetchCoOwnerProfile(userId) {
  if (!userId) {
    console.error("Cannot fetch profile: No user ID provided");
    throw new Error("You must be logged in to fetch your profile");
  }
  
  try {
    console.log("Fetching co-owner profile for user:", userId);
    
    const { data, error } = await supabase
      .from('co_owner')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching co-owner profile:", error);
      throw error;
    }
    
    console.log("Co-owner profile fetched:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchCoOwnerProfile:", error);
    throw error;
  }
}

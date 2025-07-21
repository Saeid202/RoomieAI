import { supabase } from "@/integrations/supabase/client";

/**
 * Creates and initializes database tables and functions needed for the application
 */
export async function initializeDatabase() {
  console.log("Initializing database...");
  // Database is now handled via Supabase migrations
  console.log("Database initialization complete - using Supabase managed schema");
}

/**
 * Saves profile data to the roommate table specifically
 * @param formData The form data to save
 * @param userId The user ID to associate with this profile
 * @returns The result of the save operation
 */
export async function saveRoommateProfile(formData: any, userId: string) {
  if (!userId) {
    console.error("Cannot save profile: No user ID provided");
    throw new Error("You must be logged in to save your profile");
  }
  
  try {
    console.log("Saving roommate profile for user:", userId);
    
    // Add user_id and timestamp to the data
    const dbData = {
      ...formData,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    
    console.log("Database data to save:", dbData);
    
    // First check if a profile exists for this user
    const { data: existingProfile, error: fetchError } = await supabase
      .from('roommate')
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
        .from('roommate')
        .update(dbData)
        .eq('user_id', userId)
        .select();
    } else {
      // Insert new profile
      console.log("Creating new roommate profile");
      result = await supabase
        .from('roommate')
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
    console.error("Error in saveRoommateProfile:", error);
    throw error;
  }
}

/**
 * Fetches roommate profile data for a user
 * @param userId The user ID to fetch the profile for
 * @returns The profile data
 */
export async function fetchRoommateProfile(userId: string) {
  if (!userId) {
    console.error("Cannot fetch profile: No user ID provided");
    throw new Error("You must be logged in to fetch your profile");
  }
  
  try {
    console.log("Fetching roommate profile for user:", userId);
    
    const { data, error } = await supabase
      .from('roommate')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
              
    if (error) {
      console.error("Error fetching roommate profile:", error);
      throw error;
    }
    
    console.log("Roommate profile fetched:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchRoommateProfile:", error);
    throw error;
  }
}
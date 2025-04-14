
import { supabase } from "@/integrations/supabase/client";
import { ProfileFormValues } from "@/types/profile";

/**
 * Fetch roommate profile data for the current user
 */
export async function fetchRoommateProfile(userId: string) {
  if (!userId) {
    console.log("No user ID provided, skipping profile fetch");
    return { data: null, error: null };
  }
  
  console.log("Fetching roommate profile for user:", userId);
  
  const { data, error } = await supabase
    .from('Find My Ideal Roommate')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching roommate profile:", error);
  } else {
    console.log("Fetched roommate profile data:", data);
  }
  
  return { data, error };
}

/**
 * Save roommate profile data to the database
 */
export async function saveRoommateProfile(
  userId: string, 
  formData: ProfileFormValues
) {
  if (!userId) {
    console.error("No user ID provided, cannot save profile");
    throw new Error("User ID is required to save profile");
  }
  
  console.log("Saving roommate profile for user:", userId);
  
  // Ensure all dates are properly serialized for storage
  const preparedFormData = {
    ...formData,
    moveInDate: formData.moveInDate instanceof Date 
      ? formData.moveInDate.toISOString() 
      : formData.moveInDate,
  };
  
  // Log the dealbreakers, house habits, and lifestyle preferences for debugging
  console.log("Saving dealbreakers:", preparedFormData.dealBreakers);
  console.log("Saving house habits:", preparedFormData.houseHabits);
  console.log("Saving lifestyle preferences:", preparedFormData.lifestylePreferences);
  
  // Prepare data for saving to the database
  const dbData = {
    user_id: userId,
    profile_data: preparedFormData,
    updated_at: new Date().toISOString()
  };
  
  console.log("Prepared database data:", dbData);
  
  // Check if user already has a profile
  const { data: existingProfile, error: checkError } = await supabase
    .from('Find My Ideal Roommate')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (checkError && checkError.code !== 'PGRST116') {
    console.error("Error checking existing profile:", checkError);
    throw checkError;
  }
  
  let result;
  if (existingProfile) {
    // Update existing profile
    console.log("Updating existing profile with ID:", existingProfile.id);
    result = await supabase
      .from('Find My Ideal Roommate')
      .update(dbData)
      .eq('user_id', userId);
  } else {
    // Insert new profile
    console.log("Creating new profile for user:", userId);
    result = await supabase
      .from('Find My Ideal Roommate')
      .insert(dbData);
  }
  
  if (result.error) {
    console.error("Error saving profile:", result.error);
    throw result.error;
  }
  
  console.log("Profile saved successfully:", result);
  
  return result;
}

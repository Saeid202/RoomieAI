import { supabase } from "@/integrations/supabase/client";
import { ProfileFormValues } from "@/types/profile";
import { mapFormDataToDbSchema } from "./mapFormDataToDbSchema";
import { mapDbDataToFormSchema } from "./mapDbDataToFormSchema";

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
    .from("roommate")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching roommate profile:", error);
  } else if (data) {
    // Use the mapping function to extract preferences from JSONB
    const profileData = mapDbDataToFormSchema(data);
    console.log("Mapped profile data:", profileData);
    
    return { data: profileData, error };
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

  console.log("roommateService - Saving roommate profile for user:", userId);
  console.log("roommateService - Form data received:", formData);

  try {
   
    const dbData = mapFormDataToDbSchema(formData, userId);

    console.log("Prepared database data:", dbData);

    // Check if user already has a profile
    const { data: existingProfile, error: checkError } = await supabase
      .from("roommate")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing profile:", checkError);
      throw new Error(`Database error: ${checkError.message}`);
    }

    let result;

    if (existingProfile) {
      // Update existing profile
      console.log("Updating existing profile with ID:", existingProfile.id);
      const { data, error } = await supabase
        .from("roommate")
        .update(dbData)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      result = data;
    } else {
      // Insert new profile
      console.log("Creating new profile for user:", userId);
      const { data, error } = await supabase
        .from("roommate")
        .insert({
          ...dbData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating profile:", error);
        throw new Error(`Failed to create profile: ${error.message}`);
      }

      result = data;
    }

    console.log("Profile saved successfully:", result);
    return result;
  } catch (error) {
    console.error("Error in saveRoommateProfile:", error);

    // Re-throw with more context if it's not already a custom error
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("An unexpected error occurred while saving your profile");
  }
}

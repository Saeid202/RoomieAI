
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
    .from('roommate')
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
  
  // Map form data to database format
  const dbData = {
    user_id: userId,
    full_name: formData.fullName,
    age: parseInt(formData.age),
    gender: formData.gender,
    email: formData.email,
    phone_number: formData.phoneNumber,
    linkedin_profile: formData.linkedinProfile,
    preferred_location: Array.isArray(formData.preferredLocation) 
      ? formData.preferredLocation.join(',') 
      : formData.preferredLocation,
    budget_range: Array.isArray(formData.budgetRange) 
      ? formData.budgetRange.join('-') 
      : String(formData.budgetRange),
    move_in_date: formData.moveInDateStart instanceof Date 
      ? formData.moveInDateStart.toISOString() 
      : formData.moveInDateStart,
    housing_type: formData.housingType,
    living_space: formData.livingSpace,
    smoking: formData.smoking,
    lives_with_smokers: formData.livesWithSmokers,
    has_pets: formData.hasPets,
    pet_preference: formData.petType,
    work_location: formData.workLocation,
    work_schedule: formData.workSchedule,
    hobbies: formData.hobbies,
    diet: formData.diet,
    roommate_gender_preference: Array.isArray(formData.genderPreference) 
      ? formData.genderPreference.join(',') 
      : formData.genderPreference,
    important_roommate_traits: formData.roommateHobbies,
    updated_at: new Date().toISOString()
  };
  
  console.log("Prepared database data:", dbData);
  
  // Check if user already has a profile
  const { data: existingProfile, error: checkError } = await supabase
    .from('roommate')
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
      .from('roommate')
      .update(dbData)
      .eq('user_id', userId);
  } else {
    // Insert new profile
    console.log("Creating new profile for user:", userId);
    result = await supabase
      .from('roommate')
      .insert(dbData);
  }
  
  if (result.error) {
    console.error("Error saving profile:", result.error);
    throw result.error;
  }
  
  console.log("Profile saved successfully:", result);
  
  return result;
}

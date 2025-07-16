
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
  
  console.log("roommateService - Saving roommate profile for user:", userId);
  console.log("roommateService - Form data received:", formData);
  
  // Map form data to database format
  const dbData = {
    user_id: userId,
    full_name: formData.fullName,
    age: formData.age ? parseInt(formData.age) : null,
    gender: formData.gender || null,
    email: formData.email || null,
    phone_number: formData.phoneNumber || null,
    linkedin_profile: formData.linkedinProfile || null,
    preferred_location: Array.isArray(formData.preferredLocation) 
      ? formData.preferredLocation.join(',') 
      : formData.preferredLocation || null,
    budget_range: Array.isArray(formData.budgetRange) 
      ? `$${formData.budgetRange[0]}-$${formData.budgetRange[1]}` 
      : String(formData.budgetRange) || null,
    move_in_date: formData.moveInDateStart instanceof Date 
      ? formData.moveInDateStart.toISOString().split('T')[0] 
      : formData.moveInDateStart || null,
    housing_type: formData.housingType || null,
    living_space: formData.livingSpace || null,
    smoking: formData.smoking || false,
    lives_with_smokers: formData.livesWithSmokers || false,
    has_pets: formData.hasPets || false,
    pet_preference: formData.petType || null,
    work_location: formData.workLocation || null,
    work_schedule: formData.workSchedule || null,
    hobbies: formData.hobbies || [],
    diet: formData.diet || null,
    roommate_gender_preference: Array.isArray(formData.genderPreference) 
      ? formData.genderPreference.join(',') 
      : formData.genderPreference || null,
    important_roommate_traits: formData.roommateHobbies || [],
    
    // 🎯 FIXED: Ideal Roommate preference fields with proper validation
    age_range_preference: Array.isArray(formData.ageRangePreference) && formData.ageRangePreference.length === 2
      ? formData.ageRangePreference 
      : [18, 65], // Default fallback
    gender_preference: Array.isArray(formData.genderPreference) && formData.genderPreference.length > 0
      ? formData.genderPreference 
      : null,
    nationality_preference: formData.nationalityPreference || null,
    nationality_custom: formData.nationalityCustom || null,
    language_preference: formData.languagePreference || null,
    language_specific: formData.languageSpecific || null,
    dietary_preferences: formData.dietaryPreferences || null,
    dietary_other: formData.dietaryOther || null,
    occupation_preference: formData.occupationPreference || false,
    occupation_specific: formData.occupationSpecific || null,
    work_schedule_preference: formData.workSchedulePreference || null,
    ethnicity_preference: formData.ethnicityPreference || null,
    ethnicity_other: formData.ethnicityOther || null,
    religion_preference: formData.religionPreference || null,
    religion_other: formData.religionOther || null,
    pet_specification: formData.petSpecification || null,
    smoking_preference: formData.smokingPreference || null,
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
      .eq('user_id', userId)
      .select();
  } else {
    // Insert new profile
    console.log("Creating new profile for user:", userId);
    result = await supabase
      .from('roommate')
      .insert(dbData)
      .select();
  }
  
  if (result.error) {
    console.error("Error saving profile:", result.error);
    throw result.error;
  }
  
  console.log("Profile saved successfully:", result);
  
  return result;
}


import { ProfileFormValues } from "@/types/profile";
import { ProfileTableRow } from "@/components/dashboard/types/profileTypes";
import { CoOwnerFormValues } from "@/components/dashboard/co-owner/types";

// Convert frontend form data to database row format for roommate
export function mapFormValuesToDbRow(formData: ProfileFormValues, userId?: string): ProfileTableRow {
  // Format the move-in date to ISO string if it exists
  const moveInDate = formData.moveInDate ? new Date(formData.moveInDate).toISOString() : null;
  
  return {
    id: userId || '', // This will be replaced by the database if it's a new record
    user_id: userId,
    full_name: formData.fullName,
    age: formData.age,
    gender: formData.gender,
    phone_number: formData.phoneNumber,
    email: formData.email,
    linkedin_profile: formData.linkedinProfile,
    preferred_location: formData.preferredLocation,
    budget_range: formData.budgetRange,
    move_in_date: moveInDate,
    housing_type: formData.housingType,
    living_space: formData.livingSpace,
    smoking: formData.smoking,
    lives_with_smokers: formData.livesWithSmokers,
    has_pets: formData.hasPets,
    pet_preference: formData.petPreference,
    work_location: formData.workLocation,
    daily_routine: formData.dailyRoutine,
    hobbies: formData.hobbies,
    work_schedule: formData.workSchedule,
    sleep_schedule: formData.sleepSchedule || `${formData.sleepTime || 'Not specified'} - ${formData.wakeTime || 'Not specified'}`,
    overnight_guests: formData.overnightGuests,
    cleanliness: formData.cleanliness,
    cleaning_frequency: formData.cleaningFrequency,
    social_level: formData.socialLevel,
    guests_over: formData.guestsOver,
    family_over: formData.familyOver,
    atmosphere: formData.atmosphere,
    hosting_friends: formData.hostingFriends,
    diet: formData.diet,
    cooking_sharing: formData.cookingSharing,
    stay_duration: formData.stayDuration,
    lease_term: formData.leaseTerm,
    roommate_gender_preference: formData.roommateGenderPreference,
    roommate_age_preference: formData.roommateAgePreference,
    roommate_lifestyle_preference: formData.roommateLifestylePreference,
    important_roommate_traits: formData.importantRoommateTraits,
    updated_at: new Date().toISOString()
  };
}

// Convert database row to frontend form format for roommate
export function mapDbRowToFormValues(dbRow: any): Partial<ProfileFormValues> {
  const moveInDate = dbRow.move_in_date ? new Date(dbRow.move_in_date) : new Date();
  
  // Parse sleep schedule into sleep time and wake time if possible
  let sleepTime = "";
  let wakeTime = "";
  if (dbRow.sleep_schedule) {
    const parts = dbRow.sleep_schedule.split('-').map(part => part.trim());
    if (parts.length === 2) {
      sleepTime = parts[0];
      wakeTime = parts[1];
    }
  }
  
  return {
    fullName: dbRow.full_name || "",
    age: dbRow.age || "",
    gender: dbRow.gender || "",
    phoneNumber: dbRow.phone_number || "",
    email: dbRow.email || "",
    linkedinProfile: dbRow.linkedin_profile || "",
    preferredLocation: dbRow.preferred_location || "",
    budgetRange: dbRow.budget_range || [800, 1500],
    moveInDate: moveInDate,
    housingType: dbRow.housing_type || "apartment",
    livingSpace: dbRow.living_space || "privateRoom",
    smoking: dbRow.smoking || false,
    livesWithSmokers: dbRow.lives_with_smokers || false,
    hasPets: dbRow.has_pets || false,
    petPreference: dbRow.pet_preference || "noPets",
    workLocation: dbRow.work_location || "office",
    dailyRoutine: dbRow.daily_routine || "morning",
    hobbies: dbRow.hobbies || [],
    workSchedule: dbRow.work_schedule || "",
    sleepSchedule: dbRow.sleep_schedule || "",
    sleepTime: sleepTime,
    wakeTime: wakeTime,
    overnightGuests: dbRow.overnight_guests || "occasionally",
    cleanliness: dbRow.cleanliness || "somewhatTidy",
    cleaningFrequency: dbRow.cleaning_frequency || "weekly",
    socialLevel: dbRow.social_level || "balanced",
    guestsOver: dbRow.guests_over || "occasionally",
    familyOver: dbRow.family_over || "occasionally",
    atmosphere: dbRow.atmosphere || "balanced",
    hostingFriends: dbRow.hosting_friends || "occasionally",
    diet: dbRow.diet || "omnivore",
    cookingSharing: dbRow.cooking_sharing || "share",
    stayDuration: dbRow.stay_duration || "oneYear",
    leaseTerm: dbRow.lease_term || "longTerm",
    roommateGenderPreference: dbRow.roommate_gender_preference || "noPreference",
    roommateAgePreference: dbRow.roommate_age_preference || "similar",
    roommateLifestylePreference: dbRow.roommate_lifestyle_preference || "similar",
    importantRoommateTraits: dbRow.important_roommate_traits || [],
  };
}

// Convert co-owner form data to database row format
export function mapCoOwnerFormToDbRow(formData: CoOwnerFormValues, userId?: string): ProfileTableRow {
  return {
    id: 0, // This will be replaced by the database
    user_id: userId,
    full_name: formData.fullName,
    age: formData.age,
    email: formData.email,
    phone_number: formData.phoneNumber,
    occupation: formData.occupation,
    preferred_location: formData.preferredLocation,
    co_ownership_experience: formData.coOwnershipExperience,
    investment_capacity: formData.investmentCapacity,
    investment_timeline: formData.investmentTimeline,
    property_type: formData.propertyType,
    updated_at: new Date().toISOString()
  };
}

// Convert database row to frontend form format for co-owner
export function mapCoOwnerDbRowToFormValues(dbRow: any): Partial<CoOwnerFormValues> {
  return {
    fullName: dbRow.full_name || "",
    age: dbRow.age || "",
    email: dbRow.email || "",
    phoneNumber: dbRow.phone_number || "",
    occupation: dbRow.occupation || "",
    preferredLocation: dbRow.preferred_location || "",
    coOwnershipExperience: dbRow.co_ownership_experience || "None",
    investmentCapacity: dbRow.investment_capacity || [100000, 500000],
    investmentTimeline: dbRow.investment_timeline || "0-6 months",
    propertyType: dbRow.property_type || "Any",
  };
}

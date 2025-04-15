
import { ProfileFormValues } from "@/types/profile";
import { ProfileTableRow } from "@/components/dashboard/types/profileTypes";
import { safeString, safeBoolean, safeDate, safeArray, safeEnum } from './mapperUtils';

/**
 * Maps database row data to the ProfileFormValues format used by the form
 */
export function mapDbRowToFormValues(data: ProfileTableRow): Partial<ProfileFormValues> {
  // Create default formattedData with safe defaults
  const formattedData: Partial<ProfileFormValues> = {
    fullName: "",
    age: "",
    gender: "",
    phoneNumber: "",
    email: "",
    linkedinProfile: "",
    preferredLocation: "",
    budgetRange: [800, 1500],
    moveInDate: new Date(),
    housingType: "apartment",
    livingSpace: "privateRoom",
    smoking: false,
    livesWithSmokers: false,
    hasPets: false,
    petPreference: "noPets",
    workLocation: "office",
    dailyRoutine: "morning",
    hobbies: [],
    workSchedule: "",
    sleepSchedule: "",
    overnightGuests: "occasionally",
    cleanliness: "somewhatTidy",
    cleaningFrequency: "weekly",
    socialLevel: "balanced",
    guestsOver: "occasionally",
    familyOver: "occasionally",
    atmosphere: "balanced",
    hostingFriends: "occasionally",
    diet: "omnivore",
    cookingSharing: "share",
    stayDuration: "oneYear",
    leaseTerm: "longTerm",
    roommateGenderPreference: "noPreference",
    roommateAgePreference: "similar",
    roommateLifestylePreference: "similar",
    importantRoommateTraits: [],
  };
  
  // Basic information
  if ('full_name' in data) formattedData.fullName = safeString(data.full_name);
  if ('age' in data) formattedData.age = safeString(data.age);
  if ('gender' in data) formattedData.gender = safeString(data.gender);
  if ('phone_number' in data) formattedData.phoneNumber = safeString(data.phone_number);
  if ('email' in data) formattedData.email = safeString(data.email);
  if ('linkedin_profile' in data) formattedData.linkedinProfile = safeString(data.linkedin_profile);
  if ('preferred_location' in data) formattedData.preferredLocation = safeString(data.preferred_location);
  
  // Handle arrays and special types
  if ('budget_range' in data && data.budget_range) {
    formattedData.budgetRange = safeArray(data.budget_range, Number);
  }
  
  if ('move_in_date' in data) {
    formattedData.moveInDate = safeDate(data.move_in_date);
  }
  
  // Housing preferences
  if ('housing_type' in data) {
    formattedData.housingType = safeEnum(
      data.housing_type, 
      ["house", "apartment"], 
      "apartment"
    );
  }
  
  if ('living_space' in data) {
    formattedData.livingSpace = safeEnum(
      data.living_space, 
      ["privateRoom", "sharedRoom", "entirePlace"], 
      "privateRoom"
    );
  }
  
  // Boolean values
  if ('smoking' in data) formattedData.smoking = safeBoolean(data.smoking);
  if ('lives_with_smokers' in data) formattedData.livesWithSmokers = safeBoolean(data.lives_with_smokers);
  if ('has_pets' in data) formattedData.hasPets = safeBoolean(data.has_pets);
  
  // More enum values
  if ('pet_preference' in data) {
    formattedData.petPreference = safeEnum(
      data.pet_preference,
      ["noPets", "onlyCats", "onlyDogs", "both"],
      "noPets"
    );
  }
  
  if ('work_location' in data) {
    formattedData.workLocation = safeEnum(
      data.work_location,
      ["remote", "office", "hybrid"],
      "office"
    );
  }
  
  if ('daily_routine' in data) {
    formattedData.dailyRoutine = safeEnum(
      data.daily_routine,
      ["morning", "night", "mixed"],
      "morning"
    );
  }
  
  // Handle arrays
  if ('hobbies' in data) {
    formattedData.hobbies = safeArray(data.hobbies, String);
  }
  
  // Simple string values
  if ('work_schedule' in data) formattedData.workSchedule = safeString(data.work_schedule);
  if ('sleep_schedule' in data) formattedData.sleepSchedule = safeString(data.sleep_schedule);
  
  // Social preferences
  if ('overnight_guests' in data) {
    formattedData.overnightGuests = safeEnum(
      data.overnight_guests,
      ["yes", "no", "occasionally"],
      "occasionally"
    );
  }
  
  if ('cleanliness' in data) {
    formattedData.cleanliness = safeEnum(
      data.cleanliness,
      ["veryTidy", "somewhatTidy", "doesntMindMess"],
      "somewhatTidy"
    );
  }
  
  if ('cleaning_frequency' in data) {
    formattedData.cleaningFrequency = safeEnum(
      data.cleaning_frequency,
      ["daily", "weekly", "biweekly", "monthly", "asNeeded"],
      "weekly"
    );
  }
  
  if ('social_level' in data) {
    formattedData.socialLevel = safeEnum(
      data.social_level,
      ["extrovert", "introvert", "balanced"],
      "balanced"
    );
  }
  
  if ('guests_over' in data) {
    formattedData.guestsOver = safeEnum(
      data.guests_over,
      ["yes", "no", "occasionally"],
      "occasionally"
    );
  }
  
  if ('family_over' in data) {
    formattedData.familyOver = safeEnum(
      data.family_over,
      ["yes", "no", "occasionally"],
      "occasionally"
    );
  }
  
  if ('atmosphere' in data) {
    formattedData.atmosphere = safeEnum(
      data.atmosphere,
      ["quiet", "lively", "balanced"],
      "balanced"
    );
  }
  
  if ('hosting_friends' in data) {
    formattedData.hostingFriends = safeEnum(
      data.hosting_friends,
      ["yes", "no", "occasionally"],
      "occasionally"
    );
  }
  
  // Diet and lease preferences
  if ('diet' in data) {
    formattedData.diet = safeEnum(
      data.diet,
      ["vegetarian", "vegan", "omnivore", "other"],
      "omnivore"
    );
  }
  
  if ('cooking_sharing' in data) {
    formattedData.cookingSharing = safeEnum(
      data.cooking_sharing,
      ["share", "separate"],
      "share"
    );
  }
  
  if ('stay_duration' in data) {
    formattedData.stayDuration = safeEnum(
      data.stay_duration,
      ["threeMonths", "sixMonths", "oneYear", "flexible"],
      "oneYear"
    );
  }
  
  if ('lease_term' in data) {
    formattedData.leaseTerm = safeEnum(
      data.lease_term,
      ["shortTerm", "longTerm"],
      "longTerm"
    );
  }
  
  // Roommate preferences
  if ('roommate_gender_preference' in data) {
    formattedData.roommateGenderPreference = safeEnum(
      data.roommate_gender_preference,
      ["sameGender", "femaleOnly", "maleOnly", "noPreference"],
      "noPreference"
    );
  }
  
  if ('roommate_age_preference' in data) {
    formattedData.roommateAgePreference = safeEnum(
      data.roommate_age_preference,
      ["similar", "younger", "older", "noAgePreference"],
      "similar"
    );
  }
  
  if ('roommate_lifestyle_preference' in data) {
    formattedData.roommateLifestylePreference = safeEnum(
      data.roommate_lifestyle_preference,
      ["similar", "moreActive", "quieter", "noLifestylePreference"],
      "similar"
    );
  }
  
  if ('important_roommate_traits' in data) {
    formattedData.importantRoommateTraits = safeArray(data.important_roommate_traits, String);
  }
  
  return formattedData;
}

/**
 * Maps form values (ProfileFormValues) to database row format for saving
 */
export function mapFormValuesToDbRow(formData: ProfileFormValues, userId: string): ProfileTableRow {
  // Create the database row object with the correct types
  const dbRow: ProfileTableRow = {
    user_id: userId,
    full_name: formData.fullName,
    age: formData.age,
    gender: formData.gender,
    phone_number: formData.phoneNumber,
    email: formData.email,
    linkedin_profile: formData.linkedinProfile,
    preferred_location: formData.preferredLocation,
    budget_range: formData.budgetRange,
    move_in_date: formData.moveInDate.toISOString(),
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
    sleep_schedule: formData.sleepSchedule,
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
    updated_at: new Date().toISOString(),
  };

  return dbRow;
}

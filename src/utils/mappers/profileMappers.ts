
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
    nationality: "",
    language: "",
    ethnicity: "",
    religion: "",
    occupation: "",
    preferredLocation: [],
    budgetRange: [800, 1500],
    moveInDateStart: new Date(),
    moveInDateEnd: new Date(),
    housingType: "apartment",
    livingSpace: "privateRoom",
    smoking: false,
    livesWithSmokers: false,
    hasPets: false,
    petType: "",
    workLocation: "remote",
    workSchedule: "dayShift",
    hobbies: [],
    diet: "noRestrictions",
    // Ideal roommate defaults
    genderPreference: [],
    nationalityPreference: "noPreference",
    nationalityCustom: "",
    languagePreference: "noPreference",
    languageSpecific: "",
    ethnicReligionPreference: "noPreference",
    ethnicReligionOther: "",
    occupationPreference: false,
    occupationSpecific: "",
    workSchedulePreference: "noPreference",
    roommateHobbies: [],
    rentOption: "findTogether",
  };
  
  // Basic information
  if ('full_name' in data) formattedData.fullName = safeString(data.full_name);
  if ('age' in data) formattedData.age = safeString(data.age);
  if ('gender' in data) formattedData.gender = safeString(data.gender);
  if ('phone_number' in data) formattedData.phoneNumber = safeString(data.phone_number);
  if ('email' in data) formattedData.email = safeString(data.email);
  if ('linkedin_profile' in data) formattedData.linkedinProfile = safeString(data.linkedin_profile);
  
  // New demographic fields
  if ('nationality' in data) formattedData.nationality = safeString(data.nationality);
  if ('language' in data) formattedData.language = safeString(data.language);
  if ('ethnicity' in data) formattedData.ethnicity = safeString(data.ethnicity);
  if ('religion' in data) formattedData.religion = safeString(data.religion);
  if ('occupation' in data) formattedData.occupation = safeString(data.occupation);
  
  // Handle arrays and special types
  if ('preferred_location' in data && data.preferred_location) {
    formattedData.preferredLocation = safeArray(data.preferred_location, String);
  }
  
  if ('budget_range' in data && data.budget_range) {
    formattedData.budgetRange = safeArray(data.budget_range, Number);
  }
  
  if ('move_in_date_start' in data) {
    formattedData.moveInDateStart = safeDate(data.move_in_date_start);
  }
  
  if ('move_in_date_end' in data) {
    formattedData.moveInDateEnd = safeDate(data.move_in_date_end);
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
  if ('pet_type' in data) formattedData.petType = safeString(data.pet_type);
  
  if ('work_location' in data) {
    formattedData.workLocation = safeEnum(
      data.work_location,
      ["remote", "office", "hybrid"],
      "remote"
    );
  }
  
  if ('work_schedule' in data) {
    formattedData.workSchedule = safeEnum(
      data.work_schedule,
      ["dayShift", "afternoonShift", "overnightShift"],
      "dayShift"
    );
  }
  
  // Handle arrays
  if ('hobbies' in data) {
    formattedData.hobbies = safeArray(data.hobbies, String);
  }
  
  if ('diet' in data) {
    formattedData.diet = safeEnum(
      data.diet,
      ["vegetarian", "noRestrictions"],
      "noRestrictions"
    );
  }
  
  // Ideal roommate preferences
  if ('gender_preference' in data) {
    formattedData.genderPreference = safeArray(data.gender_preference, String);
  }
  
  if ('nationality_preference' in data) {
    formattedData.nationalityPreference = safeEnum(
      data.nationality_preference,
      ["sameCountry", "noPreference", "custom"],
      "noPreference"
    );
  }
  
  if ('nationality_custom' in data) formattedData.nationalityCustom = safeString(data.nationality_custom);
  
  if ('language_preference' in data) {
    formattedData.languagePreference = safeEnum(
      data.language_preference,
      ["sameLanguage", "noPreference", "specific"],
      "noPreference"
    );
  }
  
  if ('language_specific' in data) formattedData.languageSpecific = safeString(data.language_specific);
  
  if ('ethnic_religion_preference' in data) {
    formattedData.ethnicReligionPreference = safeEnum(
      data.ethnic_religion_preference,
      ["same", "noPreference", "other"],
      "noPreference"
    );
  }
  
  if ('ethnic_religion_other' in data) formattedData.ethnicReligionOther = safeString(data.ethnic_religion_other);
  
  if ('occupation_preference' in data) formattedData.occupationPreference = safeBoolean(data.occupation_preference);
  if ('occupation_specific' in data) formattedData.occupationSpecific = safeString(data.occupation_specific);
  
  if ('work_schedule_preference' in data) {
    formattedData.workSchedulePreference = safeEnum(
      data.work_schedule_preference,
      ["opposite", "dayShift", "nightShift", "overnightShift", "noPreference"],
      "noPreference"
    );
  }
  
  if ('roommate_hobbies' in data) {
    formattedData.roommateHobbies = safeArray(data.roommate_hobbies, String);
  }
  
  if ('rent_option' in data) {
    formattedData.rentOption = safeEnum(
      data.rent_option,
      ["findTogether", "joinExisting"],
      "findTogether"
    );
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
    nationality: formData.nationality,
    language: formData.language,
    ethnicity: formData.ethnicity,
    religion: formData.religion,
    occupation: formData.occupation,
    preferred_location: formData.preferredLocation,
    budget_range: formData.budgetRange,
    move_in_date_start: formData.moveInDateStart.toISOString(),
    move_in_date_end: formData.moveInDateEnd.toISOString(),
    housing_type: formData.housingType,
    living_space: formData.livingSpace,
    smoking: formData.smoking,
    lives_with_smokers: formData.livesWithSmokers,
    has_pets: formData.hasPets,
    pet_type: formData.petType,
    work_location: formData.workLocation,
    work_schedule: formData.workSchedule,
    hobbies: formData.hobbies,
    diet: formData.diet,
    gender_preference: formData.genderPreference,
    nationality_preference: formData.nationalityPreference,
    nationality_custom: formData.nationalityCustom,
    language_preference: formData.languagePreference,
    language_specific: formData.languageSpecific,
    ethnic_religion_preference: formData.ethnicReligionPreference,
    ethnic_religion_other: formData.ethnicReligionOther,
    occupation_preference: formData.occupationPreference,
    occupation_specific: formData.occupationSpecific,
    work_schedule_preference: formData.workSchedulePreference,
    roommate_hobbies: formData.roommateHobbies,
    rent_option: formData.rentOption,
    updated_at: new Date().toISOString(),
  };

  return dbRow;
}

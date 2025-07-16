import { ProfileFormValues } from "@/types/profile";
import { ProfileTableRow } from "@/components/dashboard/types/profileTypes";
import { safeString, safeBoolean, safeDate, safeArray, safeEnum } from './mapperUtils';

/**
 * Maps basic personal information from database to form
 */
export function mapBasicInfoDbToForm(data: ProfileTableRow): Partial<ProfileFormValues> {
  const result: Partial<ProfileFormValues> = {};
  
  if ('full_name' in data) result.fullName = safeString(data.full_name);
  if ('age' in data) result.age = safeString(data.age);
  if ('gender' in data) result.gender = safeString(data.gender);
  if ('phone_number' in data) result.phoneNumber = safeString(data.phone_number);
  if ('email' in data) result.email = safeString(data.email);
  if ('linkedin_profile' in data) result.linkedinProfile = safeString(data.linkedin_profile);
  if ('nationality' in data) result.nationality = safeString(data.nationality);
  if ('language' in data) result.language = safeString(data.language);
  if ('ethnicity' in data) result.ethnicity = safeString(data.ethnicity);
  if ('religion' in data) result.religion = safeString(data.religion);
  if ('occupation' in data) result.occupation = safeString(data.occupation);
  
  return result;
}

/**
 * Maps housing preferences from database to form
 */
export function mapHousingDbToForm(data: ProfileTableRow): Partial<ProfileFormValues> {
  const result: Partial<ProfileFormValues> = {};
  
  if ('preferred_location' in data && data.preferred_location) {
    // Handle both string and array formats for preferred_location
    if (typeof data.preferred_location === 'string') {
      try {
        result.preferredLocation = JSON.parse(data.preferred_location);
      } catch {
        result.preferredLocation = [data.preferred_location];
      }
    } else {
      result.preferredLocation = safeArray(data.preferred_location, String);
    }
  }
  
  if ('budget_range' in data && data.budget_range) {
    // Handle both string and array formats for budget_range
    if (typeof data.budget_range === 'string') {
      try {
        const parts = data.budget_range.split('-').map(Number);
        result.budgetRange = parts.length >= 2 ? parts.slice(0, 2) : [900, 1500];
      } catch {
        result.budgetRange = [900, 1500];
      }
    } else {
      result.budgetRange = safeArray(data.budget_range, Number);
    }
  }
  
  if ('move_in_date_start' in data) {
    result.moveInDateStart = safeDate(data.move_in_date_start);
  }
  
  if ('move_in_date_end' in data) {
    result.moveInDateEnd = safeDate(data.move_in_date_end);
  }
  
  if ('housing_type' in data) {
    result.housingType = safeEnum(
      data.housing_type, 
      ["house", "apartment"], 
      "apartment"
    );
  }
  
  if ('living_space' in data) {
    result.livingSpace = safeEnum(
      data.living_space, 
      ["privateRoom", "sharedRoom", "entirePlace"], 
      "privateRoom"
    );
  }
  
  return result;
}

/**
 * Maps lifestyle preferences from database to form
 */
export function mapLifestyleDbToForm(data: ProfileTableRow): Partial<ProfileFormValues> {
  const result: Partial<ProfileFormValues> = {};
  
  if ('smoking' in data) result.smoking = safeBoolean(data.smoking);
  if ('lives_with_smokers' in data) result.livesWithSmokers = safeBoolean(data.lives_with_smokers);
  if ('has_pets' in data) result.hasPets = safeBoolean(data.has_pets);
  if ('pet_type' in data) result.petType = safeString(data.pet_type);
  
  if ('work_location' in data) {
    result.workLocation = safeEnum(
      data.work_location,
      ["remote", "office", "hybrid"],
      "remote"
    );
  }
  
  if ('work_schedule' in data) {
    result.workSchedule = safeEnum(
      data.work_schedule,
      ["dayShift", "afternoonShift", "overnightShift"],
      "dayShift"
    );
  }
  
  if ('hobbies' in data) {
    result.hobbies = safeArray(data.hobbies, String);
  }
  
  if ('diet' in data) {
    result.diet = safeEnum(
      data.diet,
      ["vegetarian", "noRestrictions"],
      "noRestrictions"
    );
  }
  
  return result;
}

/**
 * Maps roommate preferences from database to form
 */
export function mapRoommatePreferencesDbToForm(data: ProfileTableRow): Partial<ProfileFormValues> {
  const result: Partial<ProfileFormValues> = {};
  
  // Age range preference
  if ('age_range_preference' in data) {
    result.ageRangePreference = safeArray(data.age_range_preference, Number);
  }
  
  if ('gender_preference' in data) {
    result.genderPreference = safeArray(data.gender_preference, String);
  }
  
  if ('nationality_preference' in data) {
    result.nationalityPreference = safeEnum(
      data.nationality_preference,
      ["sameCountry", "noPreference", "custom"],
      "noPreference"
    );
  }
  
  if ('nationality_custom' in data) result.nationalityCustom = safeString(data.nationality_custom);
  
  if ('language_preference' in data) {
    result.languagePreference = safeEnum(
      data.language_preference,
      ["sameLanguage", "noPreference", "specific"],
      "noPreference"
    );
  }
  
  if ('language_specific' in data) result.languageSpecific = safeString(data.language_specific);
  
  // Dietary preferences
  if ('dietary_preferences' in data) {
    result.dietaryPreferences = safeEnum(
      data.dietary_preferences,
      ["vegetarian", "halal", "kosher", "others", "noPreference"],
      "noPreference"
    );
  }
  
  if ('dietary_other' in data) result.dietaryOther = safeString(data.dietary_other);
  
  if ('ethnicity_preference' in data) {
    result.ethnicityPreference = safeEnum(
      data.ethnicity_preference,
      ["same", "noPreference", "others"],
      "noPreference"
    );
  }
  
  if ('ethnicity_other' in data) result.ethnicityOther = safeString(data.ethnicity_other);
  
  if ('religion_preference' in data) {
    result.religionPreference = safeEnum(
      data.religion_preference,
      ["same", "noPreference", "others"],
      "noPreference"
    );
  }
  
  if ('religion_other' in data) result.religionOther = safeString(data.religion_other);
  
  if ('occupation_preference' in data) result.occupationPreference = safeBoolean(data.occupation_preference);
  if ('occupation_specific' in data) result.occupationSpecific = safeString(data.occupation_specific);
  
  if ('work_schedule_preference' in data) {
    result.workSchedulePreference = safeEnum(
      data.work_schedule_preference,
      ["opposite", "dayShift", "nightShift", "overnightShift", "noPreference"],
      "noPreference"
    );
  }
  
  // Pet preferences
  if ('pet_preference' in data) {
    result.petPreference = safeEnum(
      data.pet_preference,
      ["noPets", "catOk", "smallPetsOk"],
      "noPets"
    );
  }
  
  if ('pet_specification' in data) result.petSpecification = safeString(data.pet_specification);
  
  // Smoking preferences
  if ('smoking_preference' in data) {
    result.smokingPreference = safeEnum(
      data.smoking_preference,
      ["noSmoking", "noVaping", "socialOk"],
      "noSmoking"
    );
  }
  
  if ('roommate_hobbies' in data) {
    result.roommateHobbies = safeArray(data.roommate_hobbies, String);
  }
  
  if ('rent_option' in data) {
    result.rentOption = safeEnum(
      data.rent_option,
      ["findTogether", "joinExisting"],
      "findTogether"
    );
  }
  
  return result;
}

/**
 * Maps basic form data to database format
 */
export function mapBasicInfoFormToDb(formData: ProfileFormValues): Partial<ProfileTableRow> {
  return {
    full_name: formData.fullName,
    age: parseInt(formData.age),
    gender: formData.gender,
    phone_number: formData.phoneNumber,
    email: formData.email,
    linkedin_profile: formData.linkedinProfile,
    nationality: formData.nationality,
    language: formData.language,
    ethnicity: formData.ethnicity,
    religion: formData.religion,
    occupation: formData.occupation,
  };
}

/**
 * Maps housing form data to database format
 */
export function mapHousingFormToDb(formData: ProfileFormValues): Partial<ProfileTableRow> {
  return {
    preferred_location: JSON.stringify(formData.preferredLocation), // Convert array to JSON string for database
    budget_range: Array.isArray(formData.budgetRange) 
      ? formData.budgetRange.join('-') 
      : String(formData.budgetRange),
    move_in_date_start: formData.moveInDateStart.toISOString(),
    move_in_date_end: formData.moveInDateEnd.toISOString(),
    housing_type: formData.housingType,
    living_space: formData.livingSpace,
  };
}

/**
 * Maps lifestyle form data to database format
 */
export function mapLifestyleFormToDb(formData: ProfileFormValues): Partial<ProfileTableRow> {
  return {
    smoking: formData.smoking,
    lives_with_smokers: formData.livesWithSmokers,
    has_pets: formData.hasPets,
    pet_type: formData.petType,
    work_location: formData.workLocation,
    work_schedule: formData.workSchedule,
    hobbies: formData.hobbies,
    diet: formData.diet,
  };
}

/**
 * Maps roommate preferences form data to database format
 */
export function mapRoommatePreferencesFormToDb(formData: ProfileFormValues): Partial<ProfileTableRow> {
  return {
    // Original preference fields
    gender_preference: formData.genderPreference,
    nationality_preference: formData.nationalityPreference,
    nationality_custom: formData.nationalityCustom,
    language_preference: formData.languagePreference,
    language_specific: formData.languageSpecific,
    ethnicity_preference: formData.ethnicityPreference,
    ethnicity_other: formData.ethnicityOther,
    religion_preference: formData.religionPreference,
    religion_other: formData.religionOther,
    occupation_preference: formData.occupationPreference,
    occupation_specific: formData.occupationSpecific,
    work_schedule_preference: formData.workSchedulePreference,
    roommate_hobbies: formData.roommateHobbies,
    rent_option: formData.rentOption,
    
    // Add missing ideal roommate preference fields
    age_range_preference: formData.ageRangePreference,
    dietary_preferences: formData.dietaryPreferences,
    dietary_other: formData.dietaryOther,
    pet_specification: formData.petSpecification,
    smoking_preference: formData.smokingPreference,
  };
}

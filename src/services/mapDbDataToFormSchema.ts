import { ProfileFormValues } from "@/types/profile";

/**
 * Maps database roommate data to form format
 * Extracts ideal_roommate_preferences JSONB column into individual form fields
 */
export function mapDbDataToFormSchema(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  userEmail?: string
): Partial<ProfileFormValues> {
  // Extract ideal roommate preferences from JSONB column
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idealPrefs: any = data.ideal_roommate_preferences || {};

  const profileData: Partial<ProfileFormValues> = {
    fullName: data.full_name || "",
    age: data.age ? String(data.age) : "",
    gender: data.gender || "",
    email: data.email || userEmail || "",
    phoneNumber: data.phone_number || "",
    linkedinProfile: data.linkedin_profile || "",
    // Fix: preferred_location is already a string[] array in database
    preferredLocation: Array.isArray(data.preferred_location)
      ? data.preferred_location
      : [],
    budgetRange:
      typeof data.budget_range === "string"
        ? [900, 1500]
        : data.budget_range || [900, 1500],
    moveInDateStart: data.move_in_date_start
      ? new Date(data.move_in_date_start)
      : new Date(),
    housingType:
      (data.housing_type as "apartment" | "house") || "apartment",
    livingSpace:
      (data.living_space as "privateRoom" | "sharedRoom" | "entirePlace") ||
      "privateRoom",
    smoking: data.smoking || false,
    livesWithSmokers: data.lives_with_smokers || false,
    hasPets: data.has_pets || false,
    petType: data.pet_preference || "",
    workLocation:
      (data.work_location as "remote" | "office" | "hybrid") || "remote",
    workSchedule:
      (data.work_schedule as "dayShift" | "afternoonShift" | "overnightShift") ||
      "dayShift",
    hobbies: Array.isArray(data.hobbies) ? data.hobbies : [],
    diet:
      (data.diet as
        | "vegetarian"
        | "halal"
        | "kosher"
        | "noPreference"
        | "other") || "noPreference",
    dietOther: data.dietary_other || "",
    nationality: data.nationality_custom || "",
    language: data.language_specific || "",
    ethnicity: data.ethnicity_other || "",
    religion: data.religion_other || "",
    occupation: data.occupation_specific || "",
    profileVisibility: Array.isArray(data.profile_visibility)
      ? data.profile_visibility
      : [],

    // Map ideal roommate preference fields from JSONB column
    ageRangePreference: idealPrefs.ageRangePreference || [18, 65],
    genderPreference: idealPrefs.genderPreference || [],
    nationalityPreference: idealPrefs.nationalityPreference || "noPreference",
    languagePreference: idealPrefs.languagePreference || "noPreference",
    ethnicityPreference: idealPrefs.ethnicityPreference || "noPreference",
    religionPreference: idealPrefs.religionPreference || "noPreference",
    occupationPreference: idealPrefs.occupationPreference || false,
    occupationSpecific: idealPrefs.occupationSpecific || "",
    workSchedulePreference: idealPrefs.workSchedulePreference || "noPreference",
    dietaryPreferences: idealPrefs.dietaryPreferences || "noPreference",
    petPreference: idealPrefs.petPreference || "noPets",
    smokingPreference: idealPrefs.smokingPreference || "noSmoking",
    housingPreference: idealPrefs.housingPreference || [],

    // Additional specific/custom fields from JSONB
    nationalityCustom: idealPrefs.nationalityCustom || "",
    languageSpecific: idealPrefs.languageSpecific || "",
    dietaryOther: idealPrefs.dietaryOther || "",
    ethnicityOther: idealPrefs.ethnicityOther || "",
    religionOther: idealPrefs.religionOther || "",
    petSpecification: idealPrefs.petSpecification || "",

    roommateHobbies: Array.isArray(data.important_roommate_traits)
      ? data.important_roommate_traits
      : [],
    rentOption: "findTogether",

    // Add importance fields from JSONB
    age_range_preference_importance: (idealPrefs.age_range_preference_importance ||
      "notImportant") as "notImportant" | "important" | "must",
    gender_preference_importance: (idealPrefs.gender_preference_importance ||
      "notImportant") as "notImportant" | "important" | "must",
    nationality_preference_importance: (idealPrefs.nationality_preference_importance ||
      "notImportant") as "notImportant" | "important" | "must",
    language_preference_importance: (idealPrefs.language_preference_importance ||
      "notImportant") as "notImportant" | "important" | "must",
    dietary_preferences_importance: (idealPrefs.dietary_preferences_importance ||
      "notImportant") as "notImportant" | "important" | "must",
    occupation_preference_importance: (idealPrefs.occupation_preference_importance ||
      "notImportant") as "notImportant" | "important" | "must",
    work_schedule_preference_importance: (idealPrefs.work_schedule_preference_importance ||
      "notImportant") as "notImportant" | "important" | "must",
    ethnicity_preference_importance: (idealPrefs.ethnicity_preference_importance ||
      "notImportant") as "notImportant" | "important" | "must",
    religion_preference_importance: (idealPrefs.religion_preference_importance ||
      "notImportant") as "notImportant" | "important" | "must",
    pet_preference_importance: (idealPrefs.pet_preference_importance ||
      "notImportant") as "notImportant" | "important" | "must",
    smoking_preference_importance: (idealPrefs.smoking_preference_importance ||
      "notImportant") as "notImportant" | "important" | "must",
    housing_preference_importance: (idealPrefs.housing_preference_importance ||
      "notImportant") as "notImportant" | "important" | "must",
  };

  return profileData;
}

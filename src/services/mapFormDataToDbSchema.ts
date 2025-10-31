import { ProfileFormValues } from "../utils/matchingAlgorithm";

export function mapFormDataToDbSchema(formData: ProfileFormValues, userId: string) {
  const dbData = {
    user_id: userId,
    full_name: formData.fullName,
    age: formData.age ? parseInt(formData.age) : null,
    gender: formData.gender || null,
    email: formData.email || null,
    phone_number: formData.phoneNumber || null,
    linkedin_profile: formData.linkedinProfile || null,

    // Privacy settings
    // profile_visibility: Array.isArray(formData.profileVisibility)
    //   ? formData.profileVisibility
    //   : [],

    // Fix: preferred_location should be TEXT[] array
    preferred_location: Array.isArray(formData.preferredLocation)
      ? formData.preferredLocation
      : formData.preferredLocation
      ? [formData.preferredLocation]
      : null,

    // Fix: budget_range should be INTEGER[] array [min, max]
    budget_range:
      Array.isArray(formData.budgetRange) && formData.budgetRange.length === 2
        ? [
            typeof formData.budgetRange[0] === "number"
              ? formData.budgetRange[0]
              : parseInt(formData.budgetRange[0]),
            typeof formData.budgetRange[1] === "number"
              ? formData.budgetRange[1]
              : parseInt(formData.budgetRange[1]),
          ]
        : null,

    // move_in_date_start:
    //   formData.moveInDateStart instanceof Date
    //     ? formData.moveInDateStart.toISOString().split("T")[0]
    //     : formData.moveInDateStart || null,
    housing_type: formData.housingType || null,
    living_space: formData.livingSpace || null,
    smoking: formData.smoking || false,
    lives_with_smokers: formData.livesWithSmokers || false,
    has_pets: formData.hasPets || false,
    pet_preference: formData.petType || null,
    work_location: formData.workLocation || null,
    work_schedule: formData.workSchedule || null,

    // Fix: hobbies should be TEXT[] array
    hobbies: Array.isArray(formData.hobbies) ? formData.hobbies : [],

    diet: formData.diet || null,

    // Fix: roommate_gender_preference should be string, not array
    // roommate_gender_preference: Array.isArray(formData.genderPreference)
    //   ? formData.genderPreference.join(",")
    //   : formData.genderPreference || null,

    // Fix: important_roommate_traits should be TEXT[] array
    important_roommate_traits: Array.isArray(formData.roommateHobbies)
      ? formData.roommateHobbies
      : [],

    // 🎯 FIXED: Ideal Roommate preference fields with proper validation
    // age_range_preference:
    //   Array.isArray(formData.ageRangePreference) &&
    //   formData.ageRangePreference.length === 2
    //     ? formData.ageRangePreference
    //     : [18, 65], // Default fallback

    // Fix: gender_preference should be TEXT[] array
    // gender_preference:
    //   Array.isArray(formData.genderPreference) &&
    //   formData.genderPreference.length > 0
    //     ? formData.genderPreference
    //     : null,

    // nationality_preference: formData.nationalityPreference || null,
    // nationality_custom:
    //   formData.nationalityCustom || formData.nationality || null,
    // language_preference: formData.languagePreference || null,
    // language_specific: formData.languageSpecific || formData.language || null,
    // dietary_preferences: formData.dietaryPreferences || null,
    // dietary_other: formData.dietaryOther || null,
    // occupation_preference: formData.occupationPreference || false,
    // occupation_specific:
    //   formData.occupationSpecific || formData.occupation || null,
    // work_schedule_preference: formData.workSchedulePreference || null,
    // ethnicity_preference: formData.ethnicityPreference || null,
    // ethnicity_other: formData.ethnicityOther || formData.ethnicity || null,
    // religion_preference: formData.religionPreference || null,
    // religion_other: formData.religionOther || formData.religion || null,
    // pet_specification: formData.petSpecification || null,
    // smoking_preference: formData.smokingPreference || null,

    // Add importance fields for ideal roommate preferences
    // age_range_preference_importance:
    //   formData.age_range_preference_importance || "notImportant",
    // gender_preference_importance:
    //   formData.gender_preference_importance || "notImportant",
    // nationality_preference_importance:
    //   formData.nationality_preference_importance || "notImportant",
    // language_preference_importance:
    //   formData.language_preference_importance || "notImportant",
    // dietary_preferences_importance:
    //   formData.dietary_preferences_importance || "notImportant",
    // occupation_preference_importance:
    //   formData.occupation_preference_importance || "notImportant",
    // work_schedule_preference_importance:
    //   formData.work_schedule_preference_importance || "notImportant",
    // ethnicity_preference_importance:
    //   formData.ethnicity_preference_importance || "notImportant",
    // religion_preference_importance:
    //   formData.religion_preference_importance || "notImportant",
    // pet_preference_importance:
    //   formData.pet_preference_importance || "notImportant",
    // smoking_preference_importance:
    //   formData.smoking_preference_importance || "notImportant",

    updated_at: new Date().toISOString(),
  };

  return dbData;
}

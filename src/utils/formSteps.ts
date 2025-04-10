
import { ProfileFormValues } from "@/types/profile";

// Get fields to validate for each step
export const getFieldsForStep = (currentStep: number): string[] => {
  switch (currentStep) {
    case 1: // Basic Information
      return ["fullName", "age", "gender", "phoneNumber", "email", "linkedinProfile"];
    case 2: // Housing Preferences
      return ["preferredLocation", "budgetRange", "moveInDate", "housingType", "livingSpace"];
    case 3: // Lifestyle & Habits
      return ["smoking", "livesWithSmokers", "hasPets", "petPreference", "workLocation", "dailyRoutine", "hobbies"];
    case 4: // Work/Sleep Schedule
      return ["workSchedule", "sleepSchedule", "overnightGuests"];
    case 5: // Cleanliness & Organization
      return ["cleanliness", "cleaningFrequency"];
    case 6: // Social Preferences
      return ["socialLevel", "guestsOver", "familyOver", "atmosphere", "hostingFriends"];
    case 7: // Cooking & Meals
      return ["diet", "cookingSharing"];
    case 8: // Lease Terms
      return ["stayDuration", "leaseTerm"];
    case 9: // Roommate Preferences
      return ["roommateGenderPreference", "roommateAgePreference", "roommateLifestylePreference", "importantRoommateTraits"];
    default:
      return [];
  }
};

// Static data for the form
export const hobbiesList = [
  "Reading", "Gaming", "Cooking", "Hiking", "Movies", 
  "Music", "Art", "Sports", "Photography", "Yoga", 
  "Crafting", "Gardening", "Writing", "Dancing", "Meditation"
];

export const roommateTraitsList = [
  "Clean", "Respectful", "Quiet", "Organized", "Sociable",
  "Responsible", "Communicative", "Considerate", "Reliable", "Friendly",
  "Adaptable", "Easygoing", "Honest", "Tidy", "Punctual"
];

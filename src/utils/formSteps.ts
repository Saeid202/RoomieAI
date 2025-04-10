
import { ProfileFormValues } from "@/types/profile";

// Get fields to validate for each step
export const getFieldsForStep = (currentStep: number): string[] => {
  switch (currentStep) {
    case 1: // Basic Information
      return ["fullName", "age", "gender", "phoneNumber", "email", "linkedinProfile"];
    case 2: // Housing Preferences + Lease Terms
      return [
        "preferredLocation", "budgetRange", "moveInDate", "housingType", "livingSpace",
        "stayDuration", "leaseTerm"
      ];
    case 3: // Lifestyle & Habits + Work/Sleep Schedule
      return [
        "smoking", "livesWithSmokers", "hasPets", "petPreference", "workLocation", 
        "dailyRoutine", "hobbies", "workSchedule", "sleepSchedule", "overnightGuests"
      ];
    case 4: // Cleanliness + Social + Cooking
      return [
        "cleanliness", "cleaningFrequency", "socialLevel", "guestsOver", 
        "familyOver", "atmosphere", "hostingFriends", "diet", "cookingSharing"
      ];
    case 5: // Roommate Preferences
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

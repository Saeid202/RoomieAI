
// Main entry point for the matching algorithm
import { findMatches } from "./roommateMatchingService";
import { findPropertyShareMatches } from "./propertyMatchingService";
import { MatchResult, ProfileData, ProfileFormValues } from "./types";

// Export the main algorithm functions
export { findMatches, findPropertyShareMatches };

// Export types
export type { MatchResult, ProfileData, ProfileFormValues };

// Helper functions for type conversion
export const convertFormToProfileData = (formData: ProfileFormValues): ProfileData => {
  return {
    name: formData.fullName,
    age: formData.age,
    gender: formData.gender || "prefer-not-to-say",
    occupation: "Not specified", // Default value
    movingDate: formData.moveInDate.toISOString().split('T')[0],
    budget: formData.budgetRange,
    location: formData.preferredLocation,
    cleanliness: formData.cleanliness === "veryTidy" ? 90 : 
                formData.cleanliness === "somewhatTidy" ? 60 : 30,
    pets: formData.hasPets,
    smoking: formData.smoking,
    drinking: "sometimes", // Default value
    guests: formData.guestsOver === "yes" ? "often" : 
           formData.guestsOver === "occasionally" ? "sometimes" : "rarely",
    sleepSchedule: formData.dailyRoutine === "morning" ? "early" : 
                  formData.dailyRoutine === "night" ? "night" : "normal",
    workSchedule: formData.workSchedule || "9AM-5PM",
    interests: formData.hobbies || [],
    traits: formData.importantRoommateTraits || [],
    preferredLiving: "findRoommate" // Default, would come from form in real implementation
  };
};

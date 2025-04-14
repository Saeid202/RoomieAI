
import { ProfileFormValues, ProfileData } from "./types";

// Map form values to the format expected by the matching algorithm
export const mapFormToProfileData = (formData: ProfileFormValues): ProfileData => {
  const workSchedule = formData.workSchedule || "9AM-5PM"; 
  
  // Convert cleanliness from string enum to number for the algorithm
  let cleanlinessValue: number;
  switch (formData.cleanliness) {
    case "veryTidy":
      cleanlinessValue = 90;
      break;
    case "somewhatTidy":
      cleanlinessValue = 60;
      break;
    case "doesntMindMess":
      cleanlinessValue = 30;
      break;
    default:
      cleanlinessValue = 60; // Default to somewhat tidy
  }
  
  return {
    name: formData.fullName,
    age: formData.age,
    gender: formData.gender || "prefer-not-to-say",
    occupation: "Not specified", // Default value
    movingDate: formData.moveInDate.toISOString().split('T')[0],
    budget: formData.budgetRange,
    location: formData.preferredLocation,
    cleanliness: cleanlinessValue,
    pets: formData.hasPets,
    smoking: formData.smoking,
    drinking: "sometimes", // Default value
    guests: formData.guestsOver === "yes" ? "often" : 
           formData.guestsOver === "occasionally" ? "sometimes" : "rarely",
    sleepSchedule: formData.dailyRoutine === "morning" ? "early" : 
                  formData.dailyRoutine === "night" ? "night" : "normal",
    workSchedule: workSchedule,
    interests: formData.hobbies || [],
    traits: formData.importantRoommateTraits || [],
    preferredLiving: "findRoommate" // Default, would come from form in real implementation
  };
};

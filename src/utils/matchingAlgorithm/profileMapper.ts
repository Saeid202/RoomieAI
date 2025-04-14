
import { ProfileFormValues, ProfileData } from "./types";

// Define the mapper function first before exporting it
export const mapFormToProfileData = (formData: ProfileFormValues): ProfileData => {
  if (!formData) {
    console.error("Form data is null or undefined");
    // Return default values to prevent crashes
    return {
      name: "Unknown",
      age: "0",
      gender: "prefer-not-to-say",
      occupation: "Not specified",
      movingDate: new Date().toISOString().split('T')[0],
      budget: [0, 0],
      location: "Not specified",
      cleanliness: 50,
      pets: false,
      smoking: false,
      drinking: "sometimes",
      guests: "rarely",
      sleepSchedule: "normal",
      workSchedule: "9AM-5PM",
      interests: [],
      traits: [],
      preferredLiving: "findRoommate"
    };
  }
  
  console.log("Mapping form data to profile data:", formData);
  
  return {
    name: formData.fullName || "Not specified",
    age: formData.age || "0",
    gender: formData.gender || "prefer-not-to-say",
    occupation: "Not specified", // Default value
    movingDate: formData.moveInDate 
      ? (formData.moveInDate instanceof Date 
        ? formData.moveInDate.toISOString().split('T')[0] 
        : String(formData.moveInDate).split('T')[0])
      : new Date().toISOString().split('T')[0],
    budget: Array.isArray(formData.budgetRange) 
      ? formData.budgetRange 
      : [800, 1500],
    location: formData.preferredLocation || "Not specified",
    cleanliness: formData.cleanliness === "veryTidy" ? 90 : 
                formData.cleanliness === "somewhatTidy" ? 60 : 30,
    pets: formData.hasPets || false,
    smoking: formData.smoking || false,
    drinking: "sometimes", // Default value
    guests: formData.guestsOver === "yes" ? "often" : 
           formData.guestsOver === "occasionally" ? "sometimes" : "rarely",
    sleepSchedule: formData.dailyRoutine === "morning" ? "early" : 
                  formData.dailyRoutine === "night" ? "night" : "normal",
    workSchedule: formData.workSchedule || "9AM-5PM",
    interests: Array.isArray(formData.hobbies) ? formData.hobbies : [],
    traits: Array.isArray(formData.importantRoommateTraits) 
      ? formData.importantRoommateTraits 
      : [],
    preferredLiving: "findRoommate" // Default, would come from form in real implementation
  };
};

// After defining the function, we can export it under a different name
export const convertFormToProfileData = mapFormToProfileData;

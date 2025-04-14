
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
  
  // Ensure budget range is valid
  const budgetRange = Array.isArray(formData.budgetRange) 
    ? formData.budgetRange 
    : [800, 1500];
  
  // Ensure date is properly formatted
  let moveInDateString = new Date().toISOString().split('T')[0]; // Default to today
  
  if (formData.moveInDate) {
    if (formData.moveInDate instanceof Date) {
      moveInDateString = formData.moveInDate.toISOString().split('T')[0];
    } else if (typeof formData.moveInDate === 'string') {
      // Try to parse the string to make sure it's a valid date
      try {
        const dateObj = new Date(formData.moveInDate);
        if (!isNaN(dateObj.getTime())) {
          moveInDateString = dateObj.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error("Error parsing moveInDate:", e);
      }
    }
  }
  
  // Ensure hobbies and traits are arrays
  const hobbies = Array.isArray(formData.hobbies) ? formData.hobbies : [];
  const traits = Array.isArray(formData.importantRoommateTraits) 
    ? formData.importantRoommateTraits 
    : [];
  
  return {
    name: formData.fullName || "Not specified",
    age: formData.age || "0",
    gender: formData.gender || "prefer-not-to-say",
    occupation: "Not specified", // Default value
    movingDate: moveInDateString,
    budget: budgetRange,
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
    interests: hobbies,
    traits: traits,
    preferredLiving: "findRoommate" // Default, would come from form in real implementation
  };
};

// After defining the function, we can export it under a different name
export const convertFormToProfileData = mapFormToProfileData;


import { ProfileFormValues, ProfileData } from "./types";

/**
 * Converts form data to the format expected by the matching algorithm
 */
export const mapFormToProfileData = (formData: ProfileFormValues): ProfileData => {
  if (!formData) {
    console.error("Form data is null or undefined in mapFormToProfileData");
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
  
  console.log("Mapping form data to profile data in profileMapper:", formData);
  
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
        console.error("Error parsing moveInDate in profileMapper:", e);
      }
    }
  }
  
  // Ensure hobbies and traits are arrays
  const hobbies = Array.isArray(formData.hobbies) ? formData.hobbies : [];
  const traits = Array.isArray(formData.importantRoommateTraits) 
    ? formData.importantRoommateTraits 
    : [];
  
  // Map cleanliness enum to numerical value
  let cleanlinessValue = 50; // default to middle value
  if (formData.cleanliness === "veryTidy") {
    cleanlinessValue = 90;
  } else if (formData.cleanliness === "somewhatTidy") {
    cleanlinessValue = 60;
  } else if (formData.cleanliness === "doesntMindMess") {
    cleanlinessValue = 30;
  }
  
  // Map sleep schedule 
  let sleepScheduleValue = "normal";
  if (formData.dailyRoutine === "morning") {
    sleepScheduleValue = "early";
  } else if (formData.dailyRoutine === "night") {
    sleepScheduleValue = "night";
  } else {
    sleepScheduleValue = "normal";
  }
  
  // Map guests frequency
  let guestsValue = "rarely";
  if (formData.guestsOver === "yes") {
    guestsValue = "often";
  } else if (formData.guestsOver === "occasionally") {
    guestsValue = "sometimes";
  } else {
    guestsValue = "rarely";
  }
  
  const result: ProfileData = {
    name: formData.fullName || "Not specified",
    age: formData.age || "0",
    gender: formData.gender || "prefer-not-to-say",
    occupation: "Not specified", // Default value
    movingDate: moveInDateString,
    budget: budgetRange,
    location: formData.preferredLocation || "Not specified",
    cleanliness: cleanlinessValue,
    pets: formData.hasPets || false,
    smoking: formData.smoking || false,
    drinking: "sometimes", // Default value
    guests: guestsValue,
    sleepSchedule: sleepScheduleValue,
    workSchedule: formData.workSchedule || "9AM-5PM",
    interests: hobbies,
    traits: traits,
    preferredLiving: "findRoommate" // Default, would come from form in real implementation
  };
  
  console.log("Conversion result in profileMapper:", result);
  return result;
};

// Export using both names for backward compatibility
export const convertFormToProfileData = mapFormToProfileData;


import { ProfileFormValues, ProfileData } from "./types";

/**
 * Maps form data to the profile data format expected by the matching algorithm
 */
export const mapFormToProfileData = (formData: ProfileFormValues): ProfileData => {
  // Ensure we have valid data to avoid undefined errors
  if (!formData) {
    console.error("No form data provided to mapFormToProfileData");
    return {
      name: "Unknown",
      age: "",
      gender: "prefer-not-to-say",
      occupation: "Not specified",
      movingDate: new Date().toISOString().split('T')[0],
      budget: [0, 1000],
      location: "",
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

  return {
    name: formData.fullName || "Anonymous",
    age: formData.age || "",
    gender: formData.gender || "prefer-not-to-say",
    occupation: formData.occupation || "Not specified",
    movingDate: formData.moveInDate instanceof Date 
      ? formData.moveInDate.toISOString().split('T')[0] 
      : (typeof formData.moveInDate === 'string' 
          ? formData.moveInDate 
          : new Date().toISOString().split('T')[0]),
    budget: Array.isArray(formData.budgetRange) ? formData.budgetRange : [900, 1500],
    location: formData.preferredLocation || "",
    cleanliness: formData.cleanliness === "veryTidy" ? 90 : 
                formData.cleanliness === "somewhatTidy" ? 60 : 30,
    pets: !!formData.hasPets,
    smoking: !!formData.smoking,
    drinking: "sometimes", // Default value
    guests: formData.guestsOver === "yes" ? "often" : 
           formData.guestsOver === "occasionally" ? "sometimes" : "rarely",
    sleepSchedule: formData.dailyRoutine === "morning" ? "early" : 
                  formData.dailyRoutine === "night" ? "night" : "normal",
    workSchedule: formData.workSchedule || "9AM-5PM",
    interests: Array.isArray(formData.hobbies) ? formData.hobbies : [],
    traits: Array.isArray(formData.importantRoommateTraits) ? formData.importantRoommateTraits : [],
    preferredLiving: "findRoommate" // Default, would come from form in real implementation
  };
};

// Export the function under both names for backward compatibility
export const convertFormToProfileData = mapFormToProfileData;

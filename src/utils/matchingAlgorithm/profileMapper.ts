
import { ProfileFormValues } from "@/types/profile";
import { Roommate, ProfileData } from "./types";

export function mapProfileToRoommate(profileData: Partial<ProfileFormValues>): Roommate {
  return {
    id: "current-user",
    name: profileData.fullName || "You",
    age: parseInt(profileData.age || "25"),
    gender: profileData.gender || "not-specified",
    email: profileData.email || "",
    phone: profileData.phoneNumber || "",
    profileImage: "/placeholder.svg",
    
    // Location and housing
    preferredLocation: Array.isArray(profileData.preferredLocation) 
      ? profileData.preferredLocation[0] || "Any" 
      : profileData.preferredLocation || "Any",
    budgetRange: profileData.budgetRange || [800, 1500],
    moveInDate: profileData.moveInDateStart || new Date(),
    housingType: profileData.housingType || "apartment",
    livingSpace: profileData.livingSpace || "privateRoom",
    
    // Basic preferences
    location: Array.isArray(profileData.preferredLocation) 
      ? profileData.preferredLocation[0] || "Any" 
      : profileData.preferredLocation || "Any",
    occupation: profileData.occupation || "Not specified",
    
    // Lifestyle
    smoking: profileData.smoking || false,
    pets: profileData.hasPets || false,
    workSchedule: profileData.workSchedule || "dayShift",
    hobbies: profileData.hobbies || [],
    diet: profileData.diet || "noRestrictions",
    
    // Social preferences - using existing fields as fallbacks
    socialLevel: "moderate", // Default value
    guestsOver: "occasionally", // Default value
    dailyRoutine: "flexible", // Default value
    
    // Preferences for roommates
    roommatePreferences: {
      genderPreference: profileData.genderPreference || [],
      ageRange: [20, 35], // Default range
      traits: profileData.roommateHobbies || [],
      workSchedulePreference: profileData.workSchedulePreference || "noPreference"
    },
    
    compatibilityScore: 0,
    sharedInterests: []
  };
}

export function mapFormToProfileData(profileData: Partial<ProfileFormValues>): ProfileData {
  return {
    name: profileData.fullName || "Unknown",
    age: profileData.age || "25",
    gender: profileData.gender || "not-specified", 
    occupation: profileData.occupation || "Not specified",
    movingDate: profileData.moveInDateStart?.toISOString() || new Date().toISOString(),
    budget: profileData.budgetRange || [800, 1500],
    location: Array.isArray(profileData.preferredLocation) 
      ? profileData.preferredLocation[0] || "Any" 
      : profileData.preferredLocation || "Any",
    cleanliness: 75, // Default value
    pets: profileData.hasPets || false,
    smoking: profileData.smoking || false,
    drinking: "socially", // Default value
    guests: "sometimes", // Default value  
    sleepSchedule: "normal", // Default value
    workSchedule: profileData.workSchedule || "dayShift",
    interests: profileData.hobbies || [],
    traits: profileData.roommateHobbies || [],
    preferredLiving: profileData.rentOption === "joinExisting" ? "shareProperty" : "findRoommate"
  };
}

export function convertFormToProfileData(profileData: Partial<ProfileFormValues>): ProfileData {
  return mapFormToProfileData(profileData);
}

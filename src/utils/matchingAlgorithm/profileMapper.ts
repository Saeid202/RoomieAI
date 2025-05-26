
import { ProfileFormValues } from "@/types/profile";
import { Roommate } from "./types";

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

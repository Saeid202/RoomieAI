
import { ProfileFormValues } from "@/types/profile";

// Re-export the mapper functions
export { mapDbRowToFormValues, mapFormValuesToDbRow } from "./mappers/profileMappers";
export { mapCoOwnerDbRowToFormValues, mapCoOwnerFormToDbRow } from "./mappers/coOwnerMappers";

export function createProfileSummary(profileData: Partial<ProfileFormValues>): string {
  if (!profileData) return "No profile data available";
  
  const parts = [];
  
  if (profileData.fullName) {
    parts.push(`Name: ${profileData.fullName}`);
  }
  
  if (profileData.age) {
    parts.push(`Age: ${profileData.age}`);
  }
  
  if (profileData.occupation) {
    parts.push(`Occupation: ${profileData.occupation}`);
  }
  
  if (profileData.preferredLocation && profileData.preferredLocation.length > 0) {
    const locations = Array.isArray(profileData.preferredLocation) 
      ? profileData.preferredLocation.join(", ") 
      : profileData.preferredLocation;
    parts.push(`Preferred locations: ${locations}`);
  }
  
  if (profileData.budgetRange) {
    parts.push(`Budget: $${profileData.budgetRange[0]} - $${profileData.budgetRange[1]}`);
  }
  
  if (profileData.hobbies && profileData.hobbies.length > 0) {
    parts.push(`Hobbies: ${profileData.hobbies.join(", ")}`);
  }
  
  if (profileData.workSchedule) {
    parts.push(`Work schedule: ${profileData.workSchedule}`);
  }
  
  if (profileData.diet) {
    parts.push(`Diet: ${profileData.diet}`);
  }
  
  return parts.join(". ");
}

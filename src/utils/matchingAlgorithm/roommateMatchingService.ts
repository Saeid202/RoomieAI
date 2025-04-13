
import { ProfileFormValues, MatchResult } from "./types";
import { potentialRoommates } from "./mockData";
import { calculateCompatibilityScore } from "./compatibilityCalculator";
import { mapFormToProfileData } from "./profileMapper";

export const findMatches = (userProfile: ProfileFormValues): MatchResult[] => {
  // Convert form data to the format expected by the matching algorithm
  const profileData = mapFormToProfileData(userProfile);
  
  // Calculate compatibility scores for all potential roommates
  const matches = potentialRoommates.map(roommate => {
    // Apply gender preference filter
    let genderMatch = true;
    if (userProfile.roommateGenderPreference === "sameGender") {
      genderMatch = roommate.gender === profileData.gender;
    } else if (userProfile.roommateGenderPreference === "femaleOnly") {
      genderMatch = roommate.gender === "female";
    } else if (userProfile.roommateGenderPreference === "maleOnly") {
      genderMatch = roommate.gender === "male";
    }
    
    // Calculate compatibility score if gender matches
    if (!genderMatch) {
      return {
        ...roommate,
        compatibilityScore: 0,
        compatibilityBreakdown: {
          budget: 0,
          location: 0,
          lifestyle: 0,
          schedule: 0,
          interests: 0,
          cleanliness: 0
        }
      };
    }
    
    const { score, breakdown } = calculateCompatibilityScore(profileData, roommate);
    
    return {
      ...roommate,
      compatibilityScore: score,
      compatibilityBreakdown: breakdown
    };
  });
  
  // Sort by compatibility score (highest first) and filter out non-matches (score of 0)
  return matches
    .filter(match => match.compatibilityScore > 0)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};

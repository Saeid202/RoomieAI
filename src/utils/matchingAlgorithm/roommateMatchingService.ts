
import { calculateCompatibilityScore } from "./compatibilityCalculator";
import { MatchResult, ProfileData, ProfileFormValues } from "./types";
import { potentialRoommates } from "./mockData";
import { convertFormToProfileData } from "./profileMapper";

/**
 * Find potential roommate matches based on user profile
 */
export const findMatches = (userProfile: ProfileFormValues): MatchResult[] => {
  console.log("Finding matches for user profile:", userProfile);
  
  try {
    if (!userProfile) {
      console.error("User profile is null or undefined");
      return [];
    }
    
    // Convert the form values to the format expected by the matching algorithm
    const profileData = convertFormToProfileData(userProfile);
    console.log("Converted profile data:", profileData);
    
    // For a real application, this would query a database of potential matches
    // For this demo, we'll use mock data
    const potentialMatches = potentialRoommates;
    console.log("Potential matches:", potentialMatches.length);
    
    // Calculate compatibility scores for each potential match
    const matches = potentialMatches.map(match => {
      const compatibility = calculateCompatibilityScore(profileData, match);
      
      return {
        ...match,
        compatibilityScore: compatibility.score,
        compatibilityBreakdown: compatibility.breakdown
      };
    });
    
    // Sort matches by compatibility score (highest first)
    const sortedMatches = matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    console.log("Sorted matches:", sortedMatches.length);
    
    return sortedMatches;
  } catch (error) {
    console.error("Error in findMatches algorithm:", error);
    // Return empty array on error to avoid crashing
    return [];
  }
};

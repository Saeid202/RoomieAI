
import { calculateCompatibilityScore } from "./compatibilityCalculator";
import { MatchResult, ProfileData, ProfileFormValues } from "./types";
import { potentialRoommates } from "./mockData";
import { convertFormToProfileData } from "./profileMapper";

/**
 * Find potential roommate matches based on user profile
 */
export const findMatches = (userProfile: ProfileFormValues): MatchResult[] => {
  console.log("roommateMatchingService.findMatches called with:", userProfile);
  
  try {
    if (!userProfile) {
      console.error("User profile is null or undefined in roommateMatchingService");
      return [];
    }
    
    // Validate minimum required fields
    if (!userProfile.fullName || !userProfile.age) {
      console.warn("Profile data is missing essential fields in roommateMatchingService");
      return [];
    }
    
    // Convert the form values to the format expected by the matching algorithm
    const profileData = convertFormToProfileData(userProfile);
    console.log("Converted profile data in roommateMatchingService:", profileData);
    
    // For a real application, this would query a database of potential matches
    // For this demo, we'll use mock data
    const potentialMatches = potentialRoommates;
    
    if (!potentialMatches || potentialMatches.length === 0) {
      console.warn("No potential matches found in roommateMatchingService");
      return [];
    }
    
    console.log(`Found ${potentialMatches.length} potential matches to process`);
    
    // Calculate compatibility scores for each potential match
    const matches = potentialMatches.map(match => {
      try {
        const compatibility = calculateCompatibilityScore(profileData, match);
        
        return {
          ...match,
          compatibilityScore: compatibility.score,
          compatibilityBreakdown: compatibility.breakdown
        };
      } catch (error) {
        console.error("Error calculating compatibility for a match:", error);
        // Return match with low compatibility score to avoid breaking the filter
        return {
          ...match,
          compatibilityScore: 10,
          compatibilityBreakdown: {
            budget: 0,
            location: 0,
            lifestyle: 10,
            schedule: 0,
            interests: 0,
            cleanliness: 0
          }
        };
      }
    });
    
    // Sort matches by compatibility score (highest first)
    const sortedMatches = matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    console.log(`Returning ${sortedMatches.length} sorted matches from roommateMatchingService`);
    
    return sortedMatches;
  } catch (error) {
    console.error("Error in findMatches algorithm in roommateMatchingService:", error);
    // Return empty array on error to avoid crashing
    return [];
  }
};

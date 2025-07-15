
import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "./types";
import { getMockRoommates, getMockProperties } from "./mockData";
import { mapFormToProfileData } from "./profileMapper";
import { calculateCompatibilityScore } from "./compatibilityCalculator";

/**
 * Main function to find matches based on user profile
 */
export async function findMatches(userProfile: ProfileFormValues): Promise<MatchResult[]> {
  console.log("Finding matches for user profile:", userProfile);
  
  try {
    // Convert ProfileFormValues to ProfileData format
    const userProfileData = mapFormToProfileData(userProfile);
    console.log("Converted user profile data:", userProfileData);
    
    // Get all potential matches from database
    const allRoommates = await getMockRoommates();
    
    // Calculate compatibility scores for each potential match
    const matchesWithScores = allRoommates.map(roommate => {
      const compatibility = calculateCompatibilityScore(userProfileData, roommate);
      
      return {
        ...roommate,
        compatibilityScore: compatibility.score,
        compatibilityBreakdown: compatibility.breakdown
      };
    });
    
    // Sort by compatibility score (highest first) and return top matches
    const sortedMatches = matchesWithScores
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10); // Return top 10 matches
    
    console.log("Found matches:", sortedMatches);
    return sortedMatches;
    
  } catch (error) {
    console.error("Error in findMatches:", error);
    // Return empty array on error rather than throwing
    return [];
  }
}

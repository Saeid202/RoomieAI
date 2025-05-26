
import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "./types";
import { mockRoommates } from "./mockData";
import { convertFormToProfileData } from "./profileMapper";
import { calculateCompatibilityScore } from "./compatibilityCalculator";

export function findMatches(userProfile: ProfileFormValues): MatchResult[] {
  console.log("Finding roommate matches for:", userProfile);
  
  try {
    const userProfileData = convertFormToProfileData(userProfile);
    
    const matchesWithScores = mockRoommates.map(roommate => {
      const compatibility = calculateCompatibilityScore(userProfileData, roommate);
      
      return {
        ...roommate,
        compatibilityScore: compatibility.score,
        compatibilityBreakdown: compatibility.breakdown
      };
    });
    
    return matchesWithScores
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10);
      
  } catch (error) {
    console.error("Error in findMatches:", error);
    return [];
  }
}

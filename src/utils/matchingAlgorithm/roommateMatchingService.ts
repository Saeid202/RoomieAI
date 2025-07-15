
import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "./types";
import { getMockRoommates } from "./mockData";
import { convertFormToProfileData } from "./profileMapper";
import { calculateCompatibilityScore } from "./compatibilityCalculator";

export async function findMatches(userProfile: ProfileFormValues): Promise<MatchResult[]> {
  console.log("Finding roommate matches for:", userProfile);
  
  try {
    const userProfileData = convertFormToProfileData(userProfile);
    const allRoommates = await getMockRoommates();
    
    const matchesWithScores = allRoommates.map(roommate => {
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

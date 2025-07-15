
import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "./types";
import { getMockProperties } from "./mockData";
import { mapFormToProfileData } from "./profileMapper";
import { calculateCompatibilityScore } from "./compatibilityCalculator";

export async function findPropertyShareMatches(userProfile: ProfileFormValues): Promise<MatchResult[]> {
  console.log("Finding property share matches for:", userProfile);
  
  try {
    const userProfileData = mapFormToProfileData(userProfile);
    const allProperties = await getMockProperties();
    
    const propertiesWithScores = allProperties.map(property => {
      const compatibility = calculateCompatibilityScore(userProfileData, property);
      
      return {
        ...property,
        compatibilityScore: compatibility.score,
        compatibilityBreakdown: compatibility.breakdown
      };
    });
    
    return propertiesWithScores
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 5);
      
  } catch (error) {
    console.error("Error in findPropertyShareMatches:", error);
    return [];
  }
}

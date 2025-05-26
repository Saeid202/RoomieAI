
import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "./types";
import { mockProperties } from "./mockData";
import { mapFormToProfileData } from "./profileMapper";
import { calculateCompatibilityScore } from "./compatibilityCalculator";

export function findPropertyShareMatches(userProfile: ProfileFormValues): MatchResult[] {
  console.log("Finding property share matches for:", userProfile);
  
  try {
    const userProfileData = mapFormToProfileData(userProfile);
    
    const propertiesWithScores = mockProperties.map(property => {
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

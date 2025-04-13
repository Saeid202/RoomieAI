
import { ProfileFormValues, MatchResult } from "./types";
import { potentialRoommates } from "./mockData";
import { calculateCompatibilityScore } from "./compatibilityCalculator";
import { mapFormToProfileData } from "./profileMapper";

// Find properties with available roommates
export const findPropertyShareMatches = (userProfile: ProfileFormValues): MatchResult[] => {
  // Convert form data to the format expected by the matching algorithm
  const profileData = mapFormToProfileData(userProfile);
  
  // Filter for profiles that are sharing properties
  const propertyShareProfiles = potentialRoommates.filter(profile => 
    profile.preferredLiving === "shareProperty" && profile.propertyDetails
  );
  
  // Calculate compatibility for property sharing
  const matches = propertyShareProfiles.map(profile => {
    const { score, breakdown } = calculateCompatibilityScore(profileData, profile);
    
    // Apply additional criteria for property sharing
    let adjustedScore = score;
    
    // Budget adjustment: If property is within user's budget range
    if (profile.propertyDetails) {
      const estimatedRent = profile.budget[0]; // Use minimum as estimated rent
      if (estimatedRent >= profileData.budget[0] && estimatedRent <= profileData.budget[1]) {
        adjustedScore += 10;
        // Cap at 100
        if (adjustedScore > 100) adjustedScore = 100;
      }
    }
    
    return {
      ...profile,
      compatibilityScore: adjustedScore,
      compatibilityBreakdown: breakdown
    };
  });
  
  // Sort by compatibility score (highest first) and filter out low matches
  return matches
    .filter(match => match.compatibilityScore > 50) // Higher threshold for property sharing
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};

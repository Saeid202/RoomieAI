
import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "./types";
import { mockRoommates, mockProperties } from "./mockData";
import { calculateCompatibilityScore } from "./compatibilityCalculator";

export function findMatches(profileData: Partial<ProfileFormValues>): Promise<MatchResult[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Finding matches for profile:", profileData);
      
      // Get mock data
      const roommates = mockRoommates;
      const properties = mockProperties;
      
      // Calculate compatibility scores for roommates
      const roommateMatches = roommates.map(roommate => ({
        ...roommate,
        compatibilityScore: calculateCompatibilityScore(profileData, roommate)
      }));
      
      // Sort by compatibility score
      const sortedMatches = roommateMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      
      // Create match results
      const matches: MatchResult[] = sortedMatches.map(roommate => ({
        type: "roommate" as const,
        roommate,
        property: null,
        compatibilityScore: roommate.compatibilityScore,
        sharedInterests: roommate.hobbies?.filter(hobby => 
          profileData.hobbies?.includes(hobby)
        ) || []
      }));
      
      console.log("Found matches:", matches);
      resolve(matches);
    }, 1000);
  });
}

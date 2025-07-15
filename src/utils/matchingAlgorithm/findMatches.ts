
import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "./types";
import { enhancedMatchingEngine } from "@/services/enhancedMatchingService";

/**
 * Main function to find matches based on user profile using enhanced matching algorithm
 */
export async function findMatches(userProfile: ProfileFormValues): Promise<MatchResult[]> {
  console.log("Finding matches for user profile using enhanced algorithm:", userProfile);
  
  try {
    // Use the enhanced matching engine with the example.ts patterns
    const enhancedResults = await enhancedMatchingEngine.findMatches({
      currentUser: userProfile,
      maxResults: 10,
      minScore: 60,
      useAI: false // Can be enabled later for AI-enhanced matching
    });
    
    // Convert enhanced results to standard MatchResult format for compatibility
    const standardResults = enhancedResults.map(result => 
      enhancedMatchingEngine.convertToMatchResult(result)
    );
    
    console.log("Enhanced matching found results:", standardResults);
    return standardResults;
    
  } catch (error) {
    console.error("Error in enhanced findMatches:", error);
    // Return empty array on error rather than throwing
    return [];
  }
}


import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "./types";
import { idealRoommateMatchingEngine } from "@/services/idealRoommateMatchingService";

/**
 * Main function to find matches based on user profile using preference-aware matching algorithm
 */
export async function findMatches(
  userProfile: ProfileFormValues,
  userId?: string
): Promise<MatchResult[]> {
  console.log("Finding matches for user profile using ideal roommate preferences:", userProfile);
  console.log("Current user ID for filtering:", userId);

  try {
    // Use the ideal roommate matching engine with importance fields from database
    const idealRoommateResults = await idealRoommateMatchingEngine.findMatches({
      currentUser: userProfile,
      currentUserId: userId,
      maxResults: 100, // Show more results as requested
      minScore: 0      // Show all matches regardless of score
    });

    // Convert results to standard MatchResult format for compatibility
    const standardResults = idealRoommateResults.map(result =>
      idealRoommateMatchingEngine.convertToMatchResult(result)
    );

    console.log("Ideal roommate preference matching found results:", standardResults);
    return standardResults;

  } catch (error) {
    console.error("Ideal roommate matching failed:", error);
    return [];
  }
}

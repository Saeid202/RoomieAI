
import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "./types";
import { customPreferenceMatchingEngine } from "@/services/customPreferenceMatchingService";
import { enhancedMatchingEngine } from "@/services/enhancedMatchingService";
import { UserPreferences, DEFAULT_PREFERENCES } from "@/types/preferences";
import { supabase } from "@/integrations/supabase/client";

/**
 * Main function to find matches based on user profile using preference-aware matching algorithm
 */
export async function findMatches(
  userProfile: ProfileFormValues, 
  userId?: string,
  userPreferences?: UserPreferences
): Promise<MatchResult[]> {
  console.log("Finding matches for user profile using preference-aware algorithm:", userProfile);
  console.log("Current user ID for filtering:", userId);
  console.log("User preferences:", userPreferences);
  
  try {
    let preferences = userPreferences;
    
    // If no preferences provided, try to load from database
    if (!preferences && userId) {
      try {
        const { data } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', userId)
          .single();
        
        if (data?.preferences) {
          preferences = data.preferences as unknown as UserPreferences;
          console.log("Loaded user preferences from database:", preferences);
        }
      } catch (error) {
        console.warn("Could not load user preferences, using defaults:", error);
      }
    }
    
    // Fallback to default preferences if none found
    if (!preferences) {
      preferences = DEFAULT_PREFERENCES;
      console.log("Using default preferences");
    }
    
    // Use the custom preference matching engine with user preferences
    const customResults = await customPreferenceMatchingEngine.findMatches({
      currentUser: userProfile,
      currentUserId: userId,
      userPreferences: preferences,
      maxResults: 10,
      minScore: 50
    });
    
    // Convert custom results to standard MatchResult format for compatibility
    const standardResults = customResults.map(result => 
      customPreferenceMatchingEngine.convertToMatchResult(result)
    );
    
    console.log("Preference-aware matching found results:", standardResults);
    return standardResults;
    
  } catch (error) {
    console.error("Error in preference-aware findMatches, falling back to enhanced matching:", error);
    
    // Fallback to enhanced matching engine if custom matching fails
    try {
      const enhancedResults = await enhancedMatchingEngine.findMatches({
        currentUser: userProfile,
        currentUserId: userId,
        maxResults: 10,
        minScore: 60,
        useAI: false
      });
      
      const standardResults = enhancedResults.map(result => 
        enhancedMatchingEngine.convertToMatchResult(result)
      );
      
      console.log("Fallback enhanced matching found results:", standardResults);
      return standardResults;
    } catch (fallbackError) {
      console.error("Error in fallback enhanced findMatches:", fallbackError);
      return [];
    }
  }
}


import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "./types";
import { calculateCompatibilityScore } from "./compatibilityCalculator";
import { mapFormToProfileData } from "./profileMapper";
import { potentialRoommates } from "./mockData";

/**
 * Finds matching roommates based on user profile data
 */
export function findMatches(profileData: ProfileFormValues): MatchResult[] {
  try {
    console.log("Starting matching algorithm with profile data:", profileData);
    
    if (!profileData) {
      console.error("Profile data is null or undefined");
      return [];
    }
    
    // Validate minimum required fields
    if (!profileData.fullName || !profileData.age) {
      console.warn("Profile data is missing essential fields");
      return [];
    }
    
    // Map the form data to the format expected by the matching algorithm
    const userData = mapFormToProfileData(profileData);
    console.log("Mapped user data for algorithm:", userData);
    
    // Use potentialRoommates directly instead of generateMockRoommates
    const potentialMatches = potentialRoommates;
    console.log(`Found ${potentialMatches.length} potential roommates`);
    
    if (!potentialMatches || potentialMatches.length === 0) {
      console.warn("No potential matches found");
      return [];
    }
    
    // Calculate compatibility scores for each potential roommate
    const results = potentialMatches.map(roommate => {
      try {
        // Calculate compatibility score between the user and this roommate
        const compatibility = calculateCompatibilityScore(userData, roommate);
        
        // Add special weighting for deal breakers
        if (profileData.dealBreakers) {
          // If user has "no smoking" as a deal breaker and roommate smokes
          if (profileData.dealBreakers.noSmoking && roommate.smoking) {
            compatibility.score -= 30;
            compatibility.breakdown.lifestyle -= 20;
          }
          
          // Apply other deal breakers with custom logic
          if (profileData.dealBreakers.noLoudMusic && 
              roommate.traits && roommate.traits.includes("loud music lover")) {
            compatibility.score -= 20;
            compatibility.breakdown.lifestyle -= 15;
          }
        }
        
        // Apply lifestyle preferences matching
        if (profileData.lifestylePreferences) {
          // If user wants similar schedule and roommate has matching schedule
          if (profileData.lifestylePreferences.similarSchedule && 
              userData.sleepSchedule === roommate.sleepSchedule) {
            compatibility.score += 10;
            compatibility.breakdown.schedule += 10;
          }
          
          // Apply other lifestyle preferences
          if (profileData.lifestylePreferences.similarInterests && 
              userData.interests && roommate.interests) {
            // Check for shared interests
            const sharedInterests = userData.interests.filter(
              interest => roommate.interests.includes(interest)
            );
            if (sharedInterests.length > 0) {
              compatibility.score += 5 * sharedInterests.length;
              compatibility.breakdown.interests += 5 * sharedInterests.length;
            }
          }
        }
        
        // Apply house habits preferences
        if (profileData.houseHabits) {
          // Check for cleanliness if user values it
          if (profileData.houseHabits.cleansKitchen && roommate.cleanliness > 70) {
            compatibility.score += 15;
            compatibility.breakdown.cleanliness += 15;
          }
          
          // Check for quiet hours if user values it
          if (profileData.houseHabits.respectsQuietHours && 
              roommate.traits && !roommate.traits.includes("night owl")) {
            compatibility.score += 10;
            compatibility.breakdown.lifestyle += 10;
          }
        }
        
        // Return the roommate data with their compatibility score
        return {
          ...roommate,
          compatibilityScore: compatibility.score,
          compatibilityBreakdown: compatibility.breakdown
        };
      } catch (error) {
        console.error("Error calculating compatibility for a match:", error);
        // Return a default match with low compatibility to avoid breaking the array
        return {
          ...roommate,
          compatibilityScore: 10,
          compatibilityBreakdown: {
            budget: 0,
            location: 0,
            lifestyle: 10,
            schedule: 0,
            interests: 0,
            cleanliness: 0
          }
        };
      }
    });
    
    if (!results || results.length === 0) {
      console.warn("No results were generated from potential matches");
      return [];
    }
    
    // Sort by compatibility score (highest first)
    return results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  } catch (error) {
    console.error("Error in findMatches algorithm:", error);
    // Return empty array on error to avoid crashing
    return [];
  }
}

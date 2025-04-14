
import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "./types";
import { compatibilityScore } from "./compatibilityCalculator";
import { mapFormToProfileData } from "./profileMapper";
import { generateMockRoommates } from "./mockData";

/**
 * Finds matching roommates based on user profile data
 */
export function findMatches(profileData: ProfileFormValues): MatchResult[] {
  console.log("Starting matching algorithm with profile data:", profileData);
  
  // Map the form data to the format expected by the matching algorithm
  const userData = mapFormToProfileData(profileData);
  console.log("Mapped user data for algorithm:", userData);
  
  // Generate mock roommates for now - in production this would query the database
  const potentialRoommates = generateMockRoommates();
  console.log(`Generated ${potentialRoommates.length} potential roommates`);
  
  // Calculate compatibility scores for each potential roommate
  const results = potentialRoommates.map(roommate => {
    // Calculate compatibility score between the user and this roommate
    const compatibility = compatibilityScore(userData, roommate);
    
    // Add special weighting for deal breakers
    if (profileData.dealBreakers) {
      // If user has "no smoking" as a deal breaker and roommate smokes
      if (profileData.dealBreakers.noSmoking && roommate.smoking) {
        compatibility.score -= 30;
        compatibility.breakdown.lifestyle -= 20;
      }
      
      // Apply other deal breakers with custom logic
      if (profileData.dealBreakers.noLoudMusic && 
          roommate.traits.includes("loud music lover")) {
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
      if (profileData.lifestylePreferences.similarInterests) {
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
          !roommate.traits.includes("night owl")) {
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
  });
  
  // Sort by compatibility score (highest first)
  return results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

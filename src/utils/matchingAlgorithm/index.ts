
// Main entry point for the matching algorithm
import { findMatches } from "./roommateMatchingService";
import { findPropertyShareMatches } from "./propertyMatchingService";
import { MatchResult, ProfileData, ProfileFormValues } from "./types";
import { mapFormToProfileData, convertFormToProfileData } from "./profileMapper";
import { calculateCompatibilityScore } from "./compatibilityCalculator";

// Export the main algorithm functions
export { 
  findMatches, 
  findPropertyShareMatches,
  calculateCompatibilityScore
};

// Export types
export type { MatchResult, ProfileData, ProfileFormValues };

// Export the utility functions
export { mapFormToProfileData, convertFormToProfileData };

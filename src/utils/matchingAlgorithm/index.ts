
// Main entry point for the matching algorithm
import { findMatches } from "./roommateMatchingService";
import { findPropertyShareMatches } from "./propertyMatchingService";
import { MatchResult, ProfileData, ProfileFormValues } from "./types";
import { mapFormToProfileData, convertFormToProfileData } from "./profileMapper";

// Export the main algorithm functions
export { findMatches, findPropertyShareMatches };

// Export types
export type { MatchResult, ProfileData, ProfileFormValues };

// Export the utility functions
export { mapFormToProfileData, convertFormToProfileData };

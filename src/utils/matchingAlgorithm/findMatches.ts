
import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "./types";
import { generateMockRoommates, generateMockProperties } from "./mockData";
import { calculateCompatibility } from "./compatibilityCalculator";

export async function findMatches(profileData: ProfileFormValues): Promise<MatchResult[]> {
  console.log("Finding matches for profile:", profileData);

  // Generate mock data
  const mockRoommates = generateMockRoommates();
  const mockProperties = generateMockProperties();

  // Filter out matches based on basic criteria
  const filteredRoommates = mockRoommates.filter(roommate => {
    // Basic compatibility checks using the updated schema
    
    // Check smoking preference
    if (profileData.smoking !== roommate.smoking) {
      return false;
    }
    
    // Check pet compatibility
    if (profileData.hasPets !== roommate.hasPets) {
      return false;
    }
    
    // Check work schedule compatibility
    if (profileData.workSchedule && roommate.workSchedule && 
        profileData.workSchedule !== roommate.workSchedule) {
      return false;
    }
    
    return true;
  });

  // Calculate compatibility scores and create match results
  const matches: MatchResult[] = filteredRoommates.map(roommate => {
    const compatibilityScore = calculateCompatibility(profileData, roommate);
    
    return {
      id: roommate.id,
      type: 'roommate' as const,
      profile: roommate,
      compatibilityScore,
      matchReasons: [
        `${compatibilityScore}% overall compatibility`,
        'Similar lifestyle preferences',
        'Compatible work schedules'
      ],
      location: roommate.preferredLocation || 'Not specified',
      distance: Math.floor(Math.random() * 10) + 1,
    };
  });

  // Sort by compatibility score
  matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  console.log(`Found ${matches.length} compatible roommate matches`);
  return matches;
}

export async function findPropertyMatches(profileData: ProfileFormValues): Promise<MatchResult[]> {
  console.log("Finding property matches for profile:", profileData);
  
  const mockProperties = generateMockProperties();
  
  // Filter properties based on budget and location preferences
  const filteredProperties = mockProperties.filter(property => {
    if (profileData.budgetRange) {
      const [minBudget, maxBudget] = profileData.budgetRange;
      if (property.rent < minBudget || property.rent > maxBudget) {
        return false;
      }
    }
    
    return true;
  });

  // Create property match results
  const propertyMatches: MatchResult[] = filteredProperties.map(property => ({
    id: property.id,
    type: 'property' as const,
    property,
    compatibilityScore: Math.floor(Math.random() * 30) + 70, // 70-99% for properties
    matchReasons: [
      'Within budget range',
      'Preferred location',
      'Available amenities'
    ],
    location: property.location,
    distance: Math.floor(Math.random() * 15) + 1,
  }));

  // Sort by compatibility score
  propertyMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  console.log(`Found ${propertyMatches.length} property matches`);
  return propertyMatches;
}

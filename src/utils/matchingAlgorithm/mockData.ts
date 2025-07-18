
import { MatchResult } from "./types";
import { fetchRoommateProfiles, fetchCoOwnerProfiles, convertRoommateToMatchResult, convertCoOwnerToMatchResult } from "@/services/matchingService";

// Cache for fetched data
let cachedRoommates: MatchResult[] | null = null;
let cachedProperties: MatchResult[] | null = null;

export async function getMockRoommates(): Promise<MatchResult[]> {
  if (cachedRoommates) {
    return cachedRoommates;
  }

  try {
    const dbRoommates = await fetchRoommateProfiles();
    cachedRoommates = dbRoommates.map(convertRoommateToMatchResult);
    return cachedRoommates;
  } catch (error) {
    console.error('Error fetching roommates from database:', error);
    // Return fallback data if database fails
    return getFallbackRoommates();
  }
}

export async function getMockProperties(): Promise<MatchResult[]> {
  if (cachedProperties) {
    return cachedProperties;
  }

  try {
    const dbCoOwners = await fetchCoOwnerProfiles();
    cachedProperties = dbCoOwners.map(convertCoOwnerToMatchResult);
    return cachedProperties;
  } catch (error) {
    console.error('Error fetching co-owners from database:', error);
    // Return fallback data if database fails
    return getFallbackProperties();
  }
}

// Legacy exports for backward compatibility - these now fetch from database
export const mockRoommates: MatchResult[] = [];
export const mockProperties: MatchResult[] = [];

// Initialize data on import
getMockRoommates().then(data => {
  mockRoommates.splice(0, mockRoommates.length, ...data);
});

getMockProperties().then(data => {
  mockProperties.splice(0, mockProperties.length, ...data);
});

// Fallback data in case database is unavailable
function getFallbackRoommates(): MatchResult[] {
  return [
    {
      name: "Mock Alex Johnson",
      age: "25", 
      gender: "Male",
      occupation: "Software Engineer",
      movingDate: "2024-02-01",
      budget: [1200, 1800],
      location: "Downtown",
      cleanliness: 85,
      pets: false,
      smoking: false,
      drinking: "socially",
      guests: "sometimes",
      sleepSchedule: "normal",
      workSchedule: "9AM-5PM",
      interests: ["coding", "gaming", "hiking"],
      traits: ["organized", "quiet", "friendly"],
      preferredLiving: "findRoommate",
      compatibilityScore: 92,
      compatibilityBreakdown: {
        budget: 15,
        location: 15,
        lifestyle: 22,
        schedule: 14,
        interests: 8,
        cleanliness: 18
      }
    }
  ];
}

function getFallbackProperties(): MatchResult[] {
  return [
    {
      name: "Mock Modern Downtown Apartment",
      age: "2",
      gender: "N/A",
      occupation: "Property Owner",
      movingDate: "2024-01-15",
      budget: [2000, 3000],
      location: "Downtown",
      cleanliness: 95,
      pets: true,
      smoking: false,
      drinking: "allowed",
      guests: "welcome",
      sleepSchedule: "flexible",
      workSchedule: "flexible",
      interests: ["modern living", "city life"],
      traits: ["luxury", "convenient", "secure"],
      preferredLiving: "shareProperty",
      // propertyDetails removed as it's not in MatchResult type
      compatibilityScore: 89,
      compatibilityBreakdown: {
        budget: 14,
        location: 15,
        lifestyle: 20,
        schedule: 15,
        interests: 7,
        cleanliness: 18
      }
    }
  ];
}

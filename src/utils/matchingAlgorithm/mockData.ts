
import { MatchResult } from "./types";
import { fetchRoommateProfiles, convertRoommateToMatchResult } from "@/services/matchingService";

// Cache for fetched data
let cachedRoommates: MatchResult[] | null = null;
const cachedProperties: MatchResult[] | null = null;

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
    // Return empty array if database fails
    return [];
  }
}

export async function getMockProperties(): Promise<MatchResult[]> {
  return cachedProperties || []
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


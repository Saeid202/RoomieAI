
// Common types for the matching algorithm

export type ProfileData = {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  movingDate: string;
  budget: number[];
  location: string;
  cleanliness: number;
  pets: boolean;
  smoking: boolean;
  drinking: string;
  guests: string;
  sleepSchedule: string;
  workSchedule: string;
  interests: string[];
  traits: string[];
  preferredLiving: string; // "findRoommate" or "shareProperty"
  propertyDetails?: {
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    address: string;
  };
};

export type CompatibilityBreakdown = {
  budget: number;
  location: number;
  lifestyle: number;
  schedule: number;
  interests: number;
  cleanliness: number;
};

export type MatchResult = ProfileData & {
  id?: string;
  compatibilityScore: number;
  compatibilityBreakdown: CompatibilityBreakdown;
};

export type CompatibilityResult = {
  score: number;
  breakdown: CompatibilityBreakdown;
};

export type { ProfileFormValues } from "@/types/profile";

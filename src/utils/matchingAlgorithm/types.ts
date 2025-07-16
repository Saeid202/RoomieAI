
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

export type Roommate = {
  id: string;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  profileImage: string;
  
  // Location and housing
  preferredLocation: string;
  budgetRange: number[];
  moveInDate: Date;
  housingType: string;
  livingSpace: string;
  
  // Basic preferences
  location: string;
  occupation: string;
  
  // Lifestyle
  smoking: boolean;
  pets: boolean;
  workSchedule: string;
  hobbies: string[];
  diet: string;
  
  // Social preferences
  socialLevel: string;
  guestsOver: string;
  dailyRoutine: string;
  
  // Preferences for roommates
  roommatePreferences: {
    genderPreference: string[];
    ageRange: number[];
    traits: string[];
    workSchedulePreference: string;
  };
  
  compatibilityScore: number;
  sharedInterests: string[];
};

// Enhanced compatibility breakdown for detailed analysis
export type EnhancedCompatibilityBreakdown = {
  budget: number;
  location: number;
  lifestyle: number;
  schedule: number;
  interests: number;
  cleanliness: number;
  // Enhanced fields
  enhanced?: boolean;
  detailedScores?: {
    gender: number;
    age: number;
    nationality: number;
    language: number;
    ethnicity: number;
    religion: number;
    occupation: number;
    location: number;
    budget: number;
    housingType: number;
    livingSpace: number;
    smoking: number;
    pets: number;
    workSchedule: number;
    diet: number;
    hobbies: number;
    cleanliness: number;
    socialLevel: number;
    guests: number;
    sleepSchedule: number;
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

export type MatchResult = {
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
  preferredLiving: string;
  compatibilityScore: number;
  compatibilityBreakdown: CompatibilityBreakdown | EnhancedCompatibilityBreakdown;
  // Enhanced fields
  enhancedReasons?: string[];
};

export type PropertySearchResult = {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  images: string[];
  amenities: string[];
  description: string;
  availableFrom: string;
  landlordId: string;
  compatibilityScore?: number;
};

export type CompatibilityResult = {
  score: number;
  breakdown: CompatibilityBreakdown;
};

export type { ProfileFormValues } from "@/types/profile";

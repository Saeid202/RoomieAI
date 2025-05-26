
import { MatchResult } from "./types";

export const mockRoommates: MatchResult[] = [
  {
    name: "Alex Johnson",
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
  },
  {
    name: "Sarah Chen",
    age: "28",
    gender: "Female", 
    occupation: "Marketing Manager",
    movingDate: "2024-03-15",
    budget: [1000, 1600],
    location: "Midtown",
    cleanliness: 90,
    pets: true,
    smoking: false,
    drinking: "rarely",
    guests: "rarely",
    sleepSchedule: "early",
    workSchedule: "8AM-4PM",
    interests: ["yoga", "reading", "cooking"],
    traits: ["clean", "respectful", "active"],
    preferredLiving: "findRoommate",
    compatibilityScore: 87,
    compatibilityBreakdown: {
      budget: 12,
      location: 10,
      lifestyle: 25,
      schedule: 15,
      interests: 6,
      cleanliness: 19
    }
  }
];

export const mockProperties: MatchResult[] = [
  {
    name: "Modern Downtown Apartment",
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
    propertyDetails: {
      propertyType: "apartment",
      bedrooms: 2,
      bathrooms: 2,
      address: "123 Main St, Downtown"
    },
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

import { supabase } from "@/integrations/supabase/client";
import { MatchResult } from "@/utils/matchingAlgorithm/types";

export interface DatabaseRoommate {
  user_id: string;
  full_name: string;
  email: string;
  age: number;
  gender: string;
  phone_number: string;
  preferred_location: string;
  budget_range: string;
  move_in_date: string;
  housing_type: string;
  living_space: string;
  has_pets: boolean;
  smoking: boolean;
  lives_with_smokers: boolean;
  diet: string;
  work_location: string;
  work_schedule: string;
  pet_preference: string;
  roommate_gender_preference: string;
  roommate_lifestyle_preference: string;
  hobbies: string[];
  important_roommate_traits: string[];
  linkedin_profile: string;
}

export interface DatabaseCoOwner {
  user_id: string;
  full_name: string;
  email: string;
  age: number;
  occupation: string;
  phone_number: string;
  preferred_location: string;
  investment_capacity: number[];
  investment_timeline: string;
  property_type: string;
  co_ownership_experience: string;
}

export async function fetchRoommateProfiles(): Promise<DatabaseRoommate[]> {
  const { data, error } = await supabase
    .from('roommate')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching roommate profiles:', error);
    return [];
  }

  return data || [];
}

export async function fetchCoOwnerProfiles(): Promise<DatabaseCoOwner[]> {
  const { data, error } = await supabase
    .from('co_owner')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching co-owner profiles:', error);
    return [];
  }

  return data || [];
}

export function convertRoommateToMatchResult(roommate: DatabaseRoommate): MatchResult {
  // Parse budget range (e.g., "$1200-$1800" -> [1200, 1800])
  const budgetMatch = roommate.budget_range.match(/\$?(\d+)-?\$?(\d+)?/);
  const budget = budgetMatch ? [parseInt(budgetMatch[1]), parseInt(budgetMatch[2] || budgetMatch[1])] : [0, 0];

  return {
    name: roommate.full_name,
    age: roommate.age.toString(),
    gender: roommate.gender,
    occupation: "Professional", // Default since not in roommate table
    movingDate: roommate.move_in_date,
    budget: budget,
    location: roommate.preferred_location,
    cleanliness: 85, // Default score
    pets: roommate.has_pets,
    smoking: roommate.smoking,
    drinking: "socially", // Default
    guests: "sometimes", // Default
    sleepSchedule: roommate.work_schedule.includes("AM") ? "early" : "normal",
    workSchedule: roommate.work_schedule,
    interests: roommate.hobbies || [],
    traits: roommate.important_roommate_traits || [],
    preferredLiving: "findRoommate",
    compatibilityScore: Math.floor(Math.random() * 20) + 80, // Random score 80-99
    compatibilityBreakdown: {
      budget: 15,
      location: 15,
      lifestyle: 22,
      schedule: 14,
      interests: 8,
      cleanliness: 18
    }
  };
}

export function convertCoOwnerToMatchResult(coOwner: DatabaseCoOwner): MatchResult {
  return {
    name: coOwner.full_name,
    age: coOwner.age.toString(),
    gender: "N/A",
    occupation: coOwner.occupation,
    movingDate: "Flexible",
    budget: coOwner.investment_capacity || [0, 0],
    location: coOwner.preferred_location,
    cleanliness: 90,
    pets: true,
    smoking: false,
    drinking: "allowed",
    guests: "welcome",
    sleepSchedule: "flexible",
    workSchedule: "flexible",
    interests: ["real estate", "investment"],
    traits: ["professional", "experienced", coOwner.co_ownership_experience.toLowerCase()],
    preferredLiving: "shareProperty",
    propertyDetails: {
      propertyType: coOwner.property_type?.toLowerCase() || "apartment",
      bedrooms: 2,
      bathrooms: 2,
      address: coOwner.preferred_location
    },
    compatibilityScore: Math.floor(Math.random() * 20) + 75, // Random score 75-94
    compatibilityBreakdown: {
      budget: 14,
      location: 15,
      lifestyle: 20,
      schedule: 15,
      interests: 7,
      cleanliness: 18
    }
  };
}
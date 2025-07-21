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
  move_in_date_start?: string;
  move_in_date_end?: string;
  move_in_date: string; // Legacy field for compatibility
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

export async function fetchRoommateProfiles(): Promise<DatabaseRoommate[]> {
  const { data, error } = await supabase
    .from('roommate')
    .select('*')
    .order('created_at', { ascending: false });

  console.log("data===================>", data);

  if (error) {
    console.error('Error fetching roommate profiles:', error);
    return [];
  }

  return data as any;
}

// Note: Co-owner functionality is currently disabled as the table doesn't exist
// This can be re-enabled when the co_owner table is created
export async function fetchCoOwnerProfiles(): Promise<any[]> {
  console.log('Co-owner profiles feature is currently disabled');
  return [];
}

export function convertRoommateToMatchResult(roommate: DatabaseRoommate): MatchResult {
  // Parse budget range (e.g., "$1200-$1800" -> [1200, 1800])
  const budgetMatch = roommate.budget_range?.match(/\$?(\d+)-?\$?(\d+)?/);
  const budget = budgetMatch ? [parseInt(budgetMatch[1]), parseInt(budgetMatch[2] || budgetMatch[1])] : [0, 0];

  return {
    name: roommate.full_name || "Unknown",
    age: roommate.age?.toString() || "N/A",
    gender: roommate.gender || "Not specified",
    occupation: "Professional", // Default since not in roommate table
    movingDate: roommate.move_in_date || "TBD",
    budget: budget,
    location: roommate.preferred_location || "Any location",
    cleanliness: 85, // Default score
    pets: roommate.has_pets || false,
    smoking: roommate.smoking || false,
    drinking: "socially", // Default
    guests: "sometimes", // Default
    sleepSchedule: roommate.work_schedule?.includes("AM") ? "early" : "normal",
    workSchedule: roommate.work_schedule || "Not specified",
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
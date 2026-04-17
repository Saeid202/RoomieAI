import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;
import { MatchResult } from "@/utils/matchingAlgorithm/types";

export interface DatabaseRoommate {
  user_id: string;
  full_name: string;
  email: string;
  age: number;
  gender: string;
  phone_number: string;
  preferred_location: string;
  budget_range: string | number[] | { min: number; max: number };
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

export function convertRoommateToMatchResult(roommate: DatabaseRoommate): MatchResult {
  // Handle budget range - can be string, array, or other formats
  let budget: [number, number] = [0, 0];
  
  if (roommate.budget_range) {
    console.log('Processing budget_range:', roommate.budget_range, 'Type:', typeof roommate.budget_range);
    
    if (Array.isArray(roommate.budget_range)) {
      // If it's already an array
      budget = [roommate.budget_range[0] || 0, roommate.budget_range[1] || roommate.budget_range[0] || 0];
      console.log('Parsed as array:', budget);
    } else if (typeof roommate.budget_range === 'string') {
      // If it's a string, try to parse it
      const budgetMatch = roommate.budget_range.match(/\$?(\d+)-?\$?(\d+)?/);
      budget = budgetMatch ? [parseInt(budgetMatch[1]), parseInt(budgetMatch[2] || budgetMatch[1])] : [0, 0];
      console.log('Parsed as string:', budget);
    } else if (typeof roommate.budget_range === 'object') {
      // If it's an object with min/max properties
      budget = [(roommate.budget_range as any).min || 0, (roommate.budget_range as any).max || 0];
      console.log('Parsed as object:', budget);
    } else {
      console.log('Unknown budget_range format, using default [0,0]');
    }
  }

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

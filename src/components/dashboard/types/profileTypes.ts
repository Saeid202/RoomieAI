
import { ProfileFormValues } from "@/types/profile";
import { UserPreference } from "../types";

// Define the types for our database tables with user_id for RLS
export type RoommateTableRow = {
  id: string;
  full_name: string | null;
  age: string | null;
  gender: string | null;
  phone_number: string | null;
  email: string | null;
  linkedin_profile: string | null;
  preferred_location: string | null;
  budget_range: number[] | null;
  move_in_date: string | null;
  housing_type: string | null;
  living_space: string | null;
  smoking: boolean | null;
  lives_with_smokers: boolean | null;
  has_pets: boolean | null;
  pet_preference: string | null;
  work_location: string | null;
  daily_routine: string | null;
  hobbies: string[] | null;
  work_schedule: string | null;
  sleep_schedule: string | null;
  overnight_guests: string | null;
  cleanliness: string | null;
  cleaning_frequency: string | null;
  social_level: string | null;
  guests_over: string | null;
  family_over: string | null;
  atmosphere: string | null;
  hosting_friends: string | null;
  diet: string | null;
  cooking_sharing: string | null;
  stay_duration: string | null;
  lease_term: string | null;
  roommate_gender_preference: string | null;
  roommate_age_preference: string | null;
  roommate_lifestyle_preference: string | null;
  important_roommate_traits: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
};

// Define common type for all tables to avoid redundancy
// The id can be either string (for roommate table) or number (for Both table)
export type ProfileTableRow = {
  id?: string | number;
  user_id?: string | null;
  full_name?: string | null;
  age?: string | null;
  gender?: string | null;
  phone_number?: string | null;
  email?: string | null;
  linkedin_profile?: string | null;
  preferred_location?: string | null;
  budget_range?: number[] | null;
  move_in_date?: string | null;
  housing_type?: string | null;
  living_space?: string | null;
  smoking?: boolean | null;
  lives_with_smokers?: boolean | null;
  has_pets?: boolean | null;
  pet_preference?: string | null;
  work_location?: string | null;
  daily_routine?: string | null;
  hobbies?: string[] | null;
  work_schedule?: string | null;
  sleep_schedule?: string | null;
  overnight_guests?: string | null;
  cleanliness?: string | null;
  cleaning_frequency?: string | null;
  social_level?: string | null;
  guests_over?: string | null;
  family_over?: string | null;
  atmosphere?: string | null;
  hosting_friends?: string | null;
  diet?: string | null;
  cooking_sharing?: string | null;
  stay_duration?: string | null;
  lease_term?: string | null;
  roommate_gender_preference?: string | null;
  roommate_age_preference?: string | null;
  roommate_lifestyle_preference?: string | null;
  important_roommate_traits?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: any; // Allow dynamic properties
};

// Use these type aliases for better readability
export type CoOwnerTableRow = ProfileTableRow;
export type BothTableRow = ProfileTableRow;

// Define a type for the table names accepted by Supabase
export type TableName = "roommate" | "co-owner" | "Both";

export interface ProfileContentProps {
  profileData: Partial<ProfileFormValues> | null;
  loading: boolean;
  userPreference: UserPreference;
  navigate: (path: string) => void;
  handleSaveProfile: (formData: ProfileFormValues) => Promise<void>;
}

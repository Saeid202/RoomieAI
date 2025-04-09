
import { z } from "zod";

// Define the validation schema
export const profileSchema = z.object({
  // Basic Information
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 18, {
    message: "Age must be a number and at least 18",
  }),
  gender: z.string().optional(),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  linkedinProfile: z.string().optional(),
  
  // Housing Preferences
  preferredLocation: z.string().min(1, "Location is required"),
  budgetRange: z.array(z.number()).min(2).max(2),
  moveInDate: z.date({
    required_error: "Please select a move-in date",
  }),
  housingType: z.enum(["house", "apartment"]),
  livingSpace: z.enum(["privateRoom", "sharedRoom", "entirePlace"]),
  
  // Lifestyle & Habits
  smoking: z.boolean(),
  livesWithSmokers: z.boolean(),
  hasPets: z.boolean(),
  petPreference: z.enum(["noPets", "onlyCats", "onlyDogs", "both"]),
  workLocation: z.enum(["remote", "office", "hybrid"]),
  dailyRoutine: z.enum(["morning", "night", "mixed"]),
  hobbies: z.array(z.string()),
  
  // Work/Sleep Schedule
  workSchedule: z.string().min(1, "Work schedule is required"),
  sleepSchedule: z.string().min(1, "Sleep schedule is required"),
  overnightGuests: z.enum(["yes", "no", "occasionally"]),
  
  // Cleanliness & Organization
  cleanliness: z.enum(["veryTidy", "somewhatTidy", "doesntMindMess"]),
  cleaningFrequency: z.enum(["daily", "weekly", "biweekly", "monthly", "asNeeded"]),
  
  // Social Preferences
  socialLevel: z.enum(["extrovert", "introvert", "balanced"]),
  guestsOver: z.enum(["yes", "no", "occasionally"]),
  familyOver: z.enum(["yes", "no", "occasionally"]),
  atmosphere: z.enum(["quiet", "lively", "balanced"]),
  hostingFriends: z.enum(["yes", "no", "occasionally"]),
  
  // Cooking & Meals
  diet: z.enum(["vegetarian", "vegan", "omnivore", "other"]),
  cookingSharing: z.enum(["share", "separate"]),
  
  // Lease Terms
  stayDuration: z.enum(["threeMonths", "sixMonths", "oneYear", "flexible"]),
  leaseTerm: z.enum(["shortTerm", "longTerm"]),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// Type for matching algorithm results
export interface MatchResult {
  name: string;
  age: number;
  occupation: string;
  location: string;
  compatibilityScore: number;
  budget: [number, number];
  movingDate: string;
  cleanliness: number;
  pets: boolean;
  sleepSchedule: string;
  smoking: boolean;
  interests: string[];
}

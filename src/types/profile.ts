
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
  workScheduleDetails: z.string().optional(),
  sleepTime: z.string().optional(),
  wakeTime: z.string().optional(),
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
  dietaryNotes: z.string().optional(),
  
  // Lease Terms
  stayDuration: z.enum(["oneMonth", "threeMonths", "sixMonths", "oneYear", "flexible"]),
  leaseTerm: z.enum(["shortTerm", "longTerm"]),
  
  // Roommate Preferences
  roommateGenderPreference: z.enum(["sameGender", "femaleOnly", "maleOnly", "noPreference"]),
  roommateAgePreference: z.enum(["similar", "younger", "older", "noAgePreference"]),
  roommateLifestylePreference: z.enum(["similar", "moreActive", "quieter", "noLifestylePreference"]),
  importantRoommateTraits: z.array(z.string()),
  additionalComments: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// Import the MatchResult type from matchingAlgorithm to maintain consistency
import { MatchResult as AlgorithmMatchResult } from "@/utils/matchingAlgorithm";
export type MatchResult = AlgorithmMatchResult;

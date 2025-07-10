
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
  
  // New demographic fields
  nationality: z.string().optional(),
  language: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  occupation: z.string().optional(),
  
  // Housing Preferences (simplified)
  preferredLocation: z.array(z.string()).max(15, "Maximum 15 locations allowed"),
  budgetRange: z.array(z.number()).min(2).max(2),
  moveInDateStart: z.date({
    required_error: "Please select a move-in start date",
  }),
  moveInDateEnd: z.date({
    required_error: "Please select a move-in end date",
  }),
  housingType: z.enum(["house", "apartment"]),
  livingSpace: z.enum(["privateRoom", "sharedRoom", "entirePlace"]),
  
  // Lifestyle & Habits (simplified)
  smoking: z.boolean(),
  livesWithSmokers: z.boolean(),
  hasPets: z.boolean(),
  petType: z.string().optional(),
  workLocation: z.enum(["remote", "office", "hybrid"]),
  workSchedule: z.enum(["dayShift", "afternoonShift", "overnightShift"]),
  hobbies: z.array(z.string()),
  diet: z.enum(["vegetarian", "halal", "kosher", "noRestrictions", "other"]),
  dietOther: z.string().optional(),
  profileVisibility: z.array(z.string()).optional(),
  
  // Ideal Roommate Preferences
  genderPreference: z.array(z.string()),
  nationalityPreference: z.enum(["sameCountry", "noPreference", "custom"]),
  nationalityCustom: z.string().optional(),
  languagePreference: z.enum(["sameLanguage", "noPreference", "specific"]),
  languageSpecific: z.string().optional(),
  ethnicReligionPreference: z.enum(["same", "noPreference", "other"]),
  ethnicReligionOther: z.string().optional(),
  occupationPreference: z.boolean(),
  occupationSpecific: z.string().optional(),
  workSchedulePreference: z.enum(["opposite", "dayShift", "nightShift", "overnightShift", "noPreference"]),
  roommateHobbies: z.array(z.string()),
  rentOption: z.enum(["findTogether", "joinExisting"]),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// Import the MatchResult type from matchingAlgorithm to maintain consistency
import { MatchResult as AlgorithmMatchResult } from "@/utils/matchingAlgorithm";
export type MatchResult = AlgorithmMatchResult;
